import * as admin from "firebase-admin";
import { TeamStanding, calculateAllGroupStandings, selectBestThirds } from "./standings";

const db = admin.firestore();

/**
 * FIFA 2026 Round of 32 bracket mapping.
 *
 * With 48 teams: top 2 from each group (24) + 8 best 3rd-placed (32 total).
 * The bracket depends on WHICH groups the 3rd-placed teams come from.
 *
 * Simplified mapping (FIFA will publish the official one):
 * R32 slots are filled as follows:
 */
interface BracketSlot {
  matchId: string;
  homeSource: { type: "group_pos"; group: string; position: number } | { type: "best_third"; slotIndex: number };
  awaySource: { type: "group_pos"; group: string; position: number } | { type: "best_third"; slotIndex: number };
}

// Round of 32: 16 matches
// Pattern: 1st place teams vs 2nd place or best 3rd place teams
const ROUND_32_BRACKET: BracketSlot[] = [
  // Match 73: 1A vs best 3rd (slot 0)
  { matchId: "R32_1", homeSource: { type: "group_pos", group: "A", position: 1 }, awaySource: { type: "best_third", slotIndex: 0 } },
  // Match 74: 2A vs 2B
  { matchId: "R32_2", homeSource: { type: "group_pos", group: "A", position: 2 }, awaySource: { type: "group_pos", group: "B", position: 2 } },
  // Match 75: 1B vs best 3rd (slot 1)
  { matchId: "R32_3", homeSource: { type: "group_pos", group: "B", position: 1 }, awaySource: { type: "best_third", slotIndex: 1 } },
  // Match 76: 1C vs best 3rd (slot 2)
  { matchId: "R32_4", homeSource: { type: "group_pos", group: "C", position: 1 }, awaySource: { type: "best_third", slotIndex: 2 } },
  // Match 77: 2C vs 2D
  { matchId: "R32_5", homeSource: { type: "group_pos", group: "C", position: 2 }, awaySource: { type: "group_pos", group: "D", position: 2 } },
  // Match 78: 1D vs best 3rd (slot 3)
  { matchId: "R32_6", homeSource: { type: "group_pos", group: "D", position: 1 }, awaySource: { type: "best_third", slotIndex: 3 } },
  // Match 79: 1E vs best 3rd (slot 4)
  { matchId: "R32_7", homeSource: { type: "group_pos", group: "E", position: 1 }, awaySource: { type: "best_third", slotIndex: 4 } },
  // Match 80: 2E vs 2F
  { matchId: "R32_8", homeSource: { type: "group_pos", group: "E", position: 2 }, awaySource: { type: "group_pos", group: "F", position: 2 } },
  // Match 81: 1F vs best 3rd (slot 5)
  { matchId: "R32_9", homeSource: { type: "group_pos", group: "F", position: 1 }, awaySource: { type: "best_third", slotIndex: 5 } },
  // Match 82: 1G vs best 3rd (slot 6)
  { matchId: "R32_10", homeSource: { type: "group_pos", group: "G", position: 1 }, awaySource: { type: "best_third", slotIndex: 6 } },
  // Match 83: 2G vs 2H
  { matchId: "R32_11", homeSource: { type: "group_pos", group: "G", position: 2 }, awaySource: { type: "group_pos", group: "H", position: 2 } },
  // Match 84: 1H vs best 3rd (slot 7)
  { matchId: "R32_12", homeSource: { type: "group_pos", group: "H", position: 1 }, awaySource: { type: "best_third", slotIndex: 7 } },
  // Match 85: 1I vs 2J (same side bracket)
  { matchId: "R32_13", homeSource: { type: "group_pos", group: "I", position: 1 }, awaySource: { type: "group_pos", group: "J", position: 2 } },
  // Match 86: 2I vs 1J
  { matchId: "R32_14", homeSource: { type: "group_pos", group: "J", position: 1 }, awaySource: { type: "group_pos", group: "I", position: 2 } },
  // Match 87: 1K vs 2L
  { matchId: "R32_15", homeSource: { type: "group_pos", group: "K", position: 1 }, awaySource: { type: "group_pos", group: "L", position: 2 } },
  // Match 88: 1L vs 2K
  { matchId: "R32_16", homeSource: { type: "group_pos", group: "L", position: 1 }, awaySource: { type: "group_pos", group: "K", position: 2 } },
];

// Round of 16: 8 matches — winners from R32 pairs
const ROUND_16_BRACKET = [
  { matchId: "R16_1", homeFrom: "R32_1", awayFrom: "R32_2" },
  { matchId: "R16_2", homeFrom: "R32_3", awayFrom: "R32_4" },
  { matchId: "R16_3", homeFrom: "R32_5", awayFrom: "R32_6" },
  { matchId: "R16_4", homeFrom: "R32_7", awayFrom: "R32_8" },
  { matchId: "R16_5", homeFrom: "R32_9", awayFrom: "R32_10" },
  { matchId: "R16_6", homeFrom: "R32_11", awayFrom: "R32_12" },
  { matchId: "R16_7", homeFrom: "R32_13", awayFrom: "R32_14" },
  { matchId: "R16_8", homeFrom: "R32_15", awayFrom: "R32_16" },
];

// Quarter-finals: 4 matches
const QUARTER_BRACKET = [
  { matchId: "QF1", homeFrom: "R16_1", awayFrom: "R16_2" },
  { matchId: "QF2", homeFrom: "R16_3", awayFrom: "R16_4" },
  { matchId: "QF3", homeFrom: "R16_5", awayFrom: "R16_6" },
  { matchId: "QF4", homeFrom: "R16_7", awayFrom: "R16_8" },
];

// Semi-finals: 2 matches
const SEMI_BRACKET = [
  { matchId: "SF1", homeFrom: "QF1", awayFrom: "QF2" },
  { matchId: "SF2", homeFrom: "QF3", awayFrom: "QF4" },
];

// Third place and Final
const FINAL_BRACKET = [
  { matchId: "TP", homeFrom: "SF1", awayFrom: "SF2", useLoser: true },
  { matchId: "FI", homeFrom: "SF1", awayFrom: "SF2", useLoser: false },
];

/**
 * Get the winner of a finished knockout match.
 * In knockout, if fullTime is a draw, check penalties/extra time result
 * stored in the match doc.
 */
async function getMatchWinner(matchId: string): Promise<string | null> {
  const snap = await db.doc(`jogos/${matchId}`).get();
  if (!snap.exists) return null;
  const data = snap.data()!;

  if (data.status !== "ENCERRADO") return null;
  if (data.golsMandante == null || data.golsVisitante == null) return null;

  if (data.golsMandante > data.golsVisitante) return data.mandante;
  if (data.golsVisitante > data.golsMandante) return data.visitante;

  // Draw in regulation — check who advanced (penalties/extra time)
  if (data.avanca) return data.avanca;

  return null;
}

/**
 * Get the loser of a finished knockout match.
 */
async function getMatchLoser(matchId: string): Promise<string | null> {
  const snap = await db.doc(`jogos/${matchId}`).get();
  if (!snap.exists) return null;
  const data = snap.data()!;

  if (data.status !== "ENCERRADO") return null;

  const winner = await getMatchWinner(matchId);
  if (!winner) return null;

  return winner === data.mandante ? data.visitante : data.mandante;
}

/**
 * After all group stage matches are complete, populate the Round of 32.
 */
export async function populateRound32(): Promise<{ updated: number; errors: string[] }> {
  const allStandings = await calculateAllGroupStandings();
  const errors: string[] = [];

  // Check all groups have 4 teams with 3 matches played
  for (const [group, standings] of Object.entries(allStandings)) {
    if (standings.length < 4) {
      errors.push(`Group ${group} has only ${standings.length} teams with results`);
    }
    for (const t of standings) {
      if (t.played < 3) {
        errors.push(`${t.teamId} in group ${group} has only ${t.played}/3 matches`);
      }
    }
  }

  if (errors.length > 0) {
    return { updated: 0, errors };
  }

  const bestThirds = selectBestThirds(allStandings);

  if (bestThirds.length < 8) {
    return { updated: 0, errors: [`Only ${bestThirds.length} third-placed teams found, need 8`] };
  }

  const batch = db.batch();
  let updated = 0;

  for (const slot of ROUND_32_BRACKET) {
    let homeTeam: string | null = null;
    let awayTeam: string | null = null;

    // Resolve home
    if (slot.homeSource.type === "group_pos") {
      const standings = allStandings[slot.homeSource.group];
      const team = standings.find(t => t.position === slot.homeSource.position);
      homeTeam = team?.teamId ?? null;
    } else {
      homeTeam = bestThirds[slot.homeSource.slotIndex]?.teamId ?? null;
    }

    // Resolve away
    if (slot.awaySource.type === "group_pos") {
      const standings = allStandings[slot.awaySource.group];
      const team = standings.find(t => t.position === slot.awaySource.position);
      awayTeam = team?.teamId ?? null;
    } else {
      awayTeam = bestThirds[slot.awaySource.slotIndex]?.teamId ?? null;
    }

    if (homeTeam && awayTeam) {
      batch.update(db.doc(`jogos/${slot.matchId}`), {
        mandante: homeTeam,
        visitante: awayTeam,
      });
      updated++;
    } else {
      errors.push(`Could not resolve teams for ${slot.matchId}`);
    }
  }

  if (updated > 0) {
    await batch.commit();
  }

  return { updated, errors };
}

/**
 * After a knockout match finishes, propagate the winner (or loser for 3rd place)
 * to the next round.
 */
export async function propagateKnockoutWinner(finishedMatchId: string): Promise<{ updated: string | null }> {
  // Check Round of 16
  for (const slot of ROUND_16_BRACKET) {
    if (slot.homeFrom === finishedMatchId || slot.awayFrom === finishedMatchId) {
      return await updateNextRound(slot, finishedMatchId);
    }
  }

  // Check Quarter-finals
  for (const slot of QUARTER_BRACKET) {
    if (slot.homeFrom === finishedMatchId || slot.awayFrom === finishedMatchId) {
      return await updateNextRound(slot, finishedMatchId);
    }
  }

  // Check Semi-finals
  for (const slot of SEMI_BRACKET) {
    if (slot.homeFrom === finishedMatchId || slot.awayFrom === finishedMatchId) {
      return await updateNextRound(slot, finishedMatchId);
    }
  }

  // Check Final bracket (final + 3rd place)
  for (const slot of FINAL_BRACKET) {
    if (slot.homeFrom === finishedMatchId || slot.awayFrom === finishedMatchId) {
      const getTeam = slot.useLoser ? getMatchLoser : getMatchWinner;
      const team = await getTeam(finishedMatchId);
      if (!team) return { updated: null };

      const field = slot.homeFrom === finishedMatchId ? "mandante" : "visitante";
      await db.doc(`jogos/${slot.matchId}`).update({ [field]: team });
      return { updated: slot.matchId };
    }
  }

  return { updated: null };
}

async function updateNextRound(
  slot: { matchId: string; homeFrom: string; awayFrom: string },
  finishedMatchId: string
): Promise<{ updated: string | null }> {
  const winner = await getMatchWinner(finishedMatchId);
  if (!winner) return { updated: null };

  const field = slot.homeFrom === finishedMatchId ? "mandante" : "visitante";
  await db.doc(`jogos/${slot.matchId}`).update({ [field]: winner });

  return { updated: slot.matchId };
}
