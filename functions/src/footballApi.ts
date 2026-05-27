import * as admin from "firebase-admin";
import { defineString } from "firebase-functions/params";

const db = admin.firestore();
const FOOTBALL_API_KEY = defineString("FOOTBALL_API_KEY");
const BASE_URL = "https://api.football-data.org/v4";

interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  homeTeam: { name: string; tla: string };
  awayTeam: { name: string; tla: string };
  score: {
    winner: string | null;
    duration: string;
    fullTime: { home: number | null; away: number | null };
    extraTime: { home: number | null; away: number | null };
    penalties: { home: number | null; away: number | null };
  };
}

// Map football-data.org TLA codes to our internal team IDs
const TLA_MAP: Record<string, string> = {
  MEX: "MEX", RSA: "RSA", KOR: "KOR", CZE: "CZE",
  CAN: "CAN", BIH: "BIH", QAT: "QAT", SUI: "SUI",
  BRA: "BRA", MAR: "MAR", HAI: "HAI", SCO: "SCO",
  USA: "USA", PAR: "PAR", AUS: "AUS", TUR: "TUR",
  GER: "GER", CUW: "CUW", CIV: "CIV", ECU: "ECU",
  NED: "NED", JPN: "JPN", SWE: "SWE", TUN: "TUN",
  BEL: "BEL", EGY: "EGY", IRN: "IRN", NZL: "NZL",
  ESP: "ESP", CPV: "CPV", KSA: "KSA", URU: "URU",
  FRA: "FRA", SEN: "SEN", NOR: "NOR", IRQ: "IRQ",
  ARG: "ARG", ALG: "ALG", AUT: "AUT", JOR: "JOR",
  POR: "POR", COD: "COD", UZB: "UZB", COL: "COL",
  ENG: "ENG", CRO: "CRO", GHA: "GHA", PAN: "PAN",
};

function resolveTeamId(tla: string): string {
  return TLA_MAP[tla] || tla;
}

/**
 * Fetch finished matches from football-data.org API.
 */
async function fetchFinishedMatches(): Promise<ApiMatch[]> {
  const url = `${BASE_URL}/competitions/WC/matches?status=FINISHED`;

  const response = await fetch(url, {
    headers: { "X-Auth-Token": FOOTBALL_API_KEY.value() },
  });

  if (!response.ok) {
    throw new Error(`football-data.org API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.matches || [];
}

/**
 * Map API stage names to our internal phase names.
 */
function mapStage(stage: string): string {
  const stageMap: Record<string, string> = {
    GROUP_STAGE: "GROUP",
    LAST_32: "ROUND_32",
    LAST_16: "ROUND_16",
    QUARTER_FINALS: "QUARTER",
    SEMI_FINALS: "SEMI",
    THIRD_PLACE: "THIRD",
    FINAL: "FINAL",
  };
  return stageMap[stage] || stage;
}

/**
 * Find our internal match ID that corresponds to an API match.
 * We match by: mandante + visitante + fase.
 * For group stage, also match by group.
 */
async function findInternalMatchId(apiMatch: ApiMatch): Promise<string | null> {
  const homeId = resolveTeamId(apiMatch.homeTeam.tla);
  const awayId = resolveTeamId(apiMatch.awayTeam.tla);
  const fase = mapStage(apiMatch.stage);

  // Try to find by mandante + visitante
  let snap = await db.collection("jogos")
    .where("mandante", "==", homeId)
    .where("visitante", "==", awayId)
    .where("fase", "==", fase)
    .limit(1)
    .get();

  if (!snap.empty) return snap.docs[0].id;

  // Fallback: search by date proximity (within 2 hours)
  const matchDate = new Date(apiMatch.utcDate);
  const twoHoursBefore = new Date(matchDate.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const twoHoursAfter = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000).toISOString();

  snap = await db.collection("jogos")
    .where("mandante", "==", homeId)
    .where("visitante", "==", awayId)
    .where("dataHora", ">=", twoHoursBefore)
    .where("dataHora", "<=", twoHoursAfter)
    .limit(1)
    .get();

  if (!snap.empty) return snap.docs[0].id;

  return null;
}

export interface SyncResult {
  synced: number;
  skipped: number;
  errors: string[];
  newResults: string[];
}

/**
 * Sync finished match results from football-data.org into Firestore.
 * Only updates matches that don't already have a result.
 */
export async function syncMatchResults(): Promise<SyncResult> {
  const apiMatches = await fetchFinishedMatches();
  const result: SyncResult = { synced: 0, skipped: 0, errors: [], newResults: [] };

  for (const apiMatch of apiMatches) {
    if (apiMatch.score.fullTime.home == null || apiMatch.score.fullTime.away == null) {
      result.skipped++;
      continue;
    }

    const matchId = await findInternalMatchId(apiMatch);
    if (!matchId) {
      result.errors.push(
        `No match found for ${apiMatch.homeTeam.tla} vs ${apiMatch.awayTeam.tla} (${apiMatch.utcDate})`
      );
      continue;
    }

    // Check if we already have a result
    const docSnap = await db.doc(`jogos/${matchId}`).get();
    const existing = docSnap.data();

    if (existing?.golsMandante != null && existing?.golsVisitante != null) {
      result.skipped++;
      continue;
    }

    // Build update data
    const updateData: Record<string, any> = {
      golsMandante: apiMatch.score.fullTime.home,
      golsVisitante: apiMatch.score.fullTime.away,
      status: "ENCERRADO",
      apiMatchId: apiMatch.id,
      sincronizadoEm: admin.firestore.FieldValue.serverTimestamp(),
    };

    // For knockout matches with extra time / penalties, record who advanced
    if (apiMatch.score.duration !== "REGULAR") {
      if (apiMatch.score.winner === "HOME_TEAM") {
        updateData.avanca = existing?.mandante || resolveTeamId(apiMatch.homeTeam.tla);
      } else if (apiMatch.score.winner === "AWAY_TEAM") {
        updateData.avanca = existing?.visitante || resolveTeamId(apiMatch.awayTeam.tla);
      }

      if (apiMatch.score.penalties.home != null) {
        updateData.penaltisMandante = apiMatch.score.penalties.home;
        updateData.penaltisVisitante = apiMatch.score.penalties.away;
      }
      if (apiMatch.score.extraTime.home != null) {
        updateData.prorrogacaoMandante = apiMatch.score.extraTime.home;
        updateData.prorrogacaoVisitante = apiMatch.score.extraTime.away;
      }
    }

    await db.doc(`jogos/${matchId}`).update(updateData);
    result.synced++;
    result.newResults.push(matchId);
  }

  return result;
}
