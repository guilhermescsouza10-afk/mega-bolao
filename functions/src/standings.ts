import * as admin from "firebase-admin";

const db = admin.firestore();

export interface TeamStanding {
  teamId: string;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}

/**
 * Calculate standings for a single group based on completed matches.
 */
export async function calculateGroupStandings(group: string): Promise<TeamStanding[]> {
  const matchesSnap = await db
    .collection("jogos")
    .where("grupo", "==", group)
    .where("status", "==", "ENCERRADO")
    .get();

  const teams: Record<string, TeamStanding> = {};

  const ensureTeam = (id: string) => {
    if (!teams[id]) {
      teams[id] = {
        teamId: id,
        group,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0,
        points: 0, position: 0,
      };
    }
  };

  for (const doc of matchesSnap.docs) {
    const m = doc.data();
    if (m.golsMandante == null || m.golsVisitante == null) continue;
    if (!m.mandante || !m.visitante) continue;

    ensureTeam(m.mandante);
    ensureTeam(m.visitante);

    const home = teams[m.mandante];
    const away = teams[m.visitante];

    home.played++;
    away.played++;
    home.goalsFor += m.golsMandante;
    home.goalsAgainst += m.golsVisitante;
    away.goalsFor += m.golsVisitante;
    away.goalsAgainst += m.golsMandante;

    if (m.golsMandante > m.golsVisitante) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (m.golsMandante < m.golsVisitante) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += 1;
      away.points += 1;
    }
  }

  // Calculate goal difference
  for (const t of Object.values(teams)) {
    t.goalDifference = t.goalsFor - t.goalsAgainst;
  }

  // Sort: points > goal diff > goals for > alphabetical
  const sorted = Object.values(teams).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamId.localeCompare(b.teamId);
  });

  sorted.forEach((t, i) => { t.position = i + 1; });

  return sorted;
}

/**
 * Calculate standings for ALL 12 groups.
 */
export async function calculateAllGroupStandings(): Promise<Record<string, TeamStanding[]>> {
  const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  const result: Record<string, TeamStanding[]> = {};

  for (const g of groups) {
    result[g] = await calculateGroupStandings(g);
  }

  return result;
}

/**
 * Select the 8 best third-placed teams from 12 groups.
 * FIFA criteria: points > goal diff > goals scored > fewer disciplinary points (simplified to alphabetical).
 */
export function selectBestThirds(allStandings: Record<string, TeamStanding[]>): TeamStanding[] {
  const thirds: TeamStanding[] = [];

  for (const standings of Object.values(allStandings)) {
    const third = standings.find(t => t.position === 3);
    if (third) thirds.push(third);
  }

  // Sort by same criteria as group standings
  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamId.localeCompare(b.teamId);
  });

  return thirds.slice(0, 8);
}
