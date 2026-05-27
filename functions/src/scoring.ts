export interface ScoreResult {
  key: string;
  points: number;
}

const SCORE_TYPES = {
  EXACT: { key: "EXACT", points: 25 },
  WINNER_BOTH_GOALS: { key: "WINNER_BOTH_GOALS", points: 15 },
  WINNER_GOAL_DIFF: { key: "WINNER_GOAL_DIFF", points: 15 },
  WINNER_LOSER_GOALS: { key: "WINNER_LOSER_GOALS", points: 12 },
  WINNER_ONLY: { key: "WINNER_ONLY", points: 6 },
  ONE_TEAM_GOALS: { key: "ONE_TEAM_GOALS", points: 3 },
  NONE: { key: "NONE", points: 0 },
};

function getOutcome(home: number, away: number): string {
  if (home > away) return "HOME";
  if (away > home) return "AWAY";
  return "DRAW";
}

export function calculateScore(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number
): ScoreResult {
  // Rule 1: Exact score
  if (predHome === realHome && predAway === realAway) {
    return SCORE_TYPES.EXACT;
  }

  const predOutcome = getOutcome(predHome, predAway);
  const realOutcome = getOutcome(realHome, realAway);

  // Both draws but different scores
  if (predOutcome === "DRAW" && realOutcome === "DRAW") {
    return SCORE_TYPES.WINNER_GOAL_DIFF;
  }

  // Winner matches
  if (predOutcome === realOutcome) {
    const winnerGoalsMatch =
      realOutcome === "HOME"
        ? predHome === realHome
        : predAway === realAway;
    const loserGoalsMatch =
      realOutcome === "HOME"
        ? predAway === realAway
        : predHome === realHome;
    const sameDiff = predHome - predAway === realHome - realAway;

    if (winnerGoalsMatch) return SCORE_TYPES.WINNER_BOTH_GOALS;
    if (sameDiff) return SCORE_TYPES.WINNER_GOAL_DIFF;
    if (loserGoalsMatch) return SCORE_TYPES.WINNER_LOSER_GOALS;
    return SCORE_TYPES.WINNER_ONLY;
  }

  // Wrong winner — check if one team's goals match
  if (predHome === realHome || predAway === realAway) {
    return SCORE_TYPES.ONE_TEAM_GOALS;
  }

  return SCORE_TYPES.NONE;
}
