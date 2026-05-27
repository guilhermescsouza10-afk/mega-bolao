export const SCORE_TYPES = {
  EXACT: { key: 'EXACT', points: 25, label: 'Placar Exato', icon: '⭐', color: 'text-yellow-400' },
  WINNER_BOTH_GOALS: { key: 'WINNER_BOTH_GOALS', points: 15, label: 'Vencedor + Gols do Vencedor', icon: '🥇', color: 'text-yellow-300' },
  WINNER_GOAL_DIFF: { key: 'WINNER_GOAL_DIFF', points: 15, label: 'Vencedor + Saldo de Gols', icon: '🥈', color: 'text-gray-300' },
  WINNER_LOSER_GOALS: { key: 'WINNER_LOSER_GOALS', points: 12, label: 'Vencedor + Gols do Perdedor', icon: '🥉', color: 'text-amber-600' },
  WINNER_ONLY: { key: 'WINNER_ONLY', points: 6, label: 'Apenas o Vencedor', icon: '🏅', color: 'text-blue-400' },
  ONE_TEAM_GOALS: { key: 'ONE_TEAM_GOALS', points: 3, label: 'Gols de Um Time', icon: '⚽', color: 'text-green-400' },
  NONE: { key: 'NONE', points: 0, label: 'Nenhum', icon: '❌', color: 'text-red-400' },
};

function getOutcome(home, away) {
  if (home > away) return 'HOME';
  if (away > home) return 'AWAY';
  return 'DRAW';
}

export function calculateScore(predHome, predAway, realHome, realAway) {
  if (predHome == null || predAway == null || realHome == null || realAway == null) {
    return SCORE_TYPES.NONE;
  }

  // Rule 1: Exact score
  if (predHome === realHome && predAway === realAway) {
    return SCORE_TYPES.EXACT;
  }

  const predOutcome = getOutcome(predHome, predAway);
  const realOutcome = getOutcome(realHome, realAway);

  // Both are draws but different scores → Rule 3 (same goal diff = 0)
  if (predOutcome === 'DRAW' && realOutcome === 'DRAW') {
    return SCORE_TYPES.WINNER_GOAL_DIFF;
  }

  // Winner matches (non-draw)
  if (predOutcome === realOutcome) {
    const winnerGoalsMatch = realOutcome === 'HOME'
      ? predHome === realHome
      : predAway === realAway;
    const loserGoalsMatch = realOutcome === 'HOME'
      ? predAway === realAway
      : predHome === realHome;
    const sameDiff = (predHome - predAway) === (realHome - realAway);

    // Rule 2: Winner correct + winner's exact goals (ex: pred 2x1 → real 2x0)
    if (winnerGoalsMatch) return SCORE_TYPES.WINNER_BOTH_GOALS;

    // Rule 3: Winner correct + same goal difference (ex: pred 2x1 → real 1x0)
    if (sameDiff) return SCORE_TYPES.WINNER_GOAL_DIFF;

    // Rule 4: Winner correct + loser's exact goals (ex: pred 2x0 → real 3x0)
    if (loserGoalsMatch) return SCORE_TYPES.WINNER_LOSER_GOALS;

    // Rule 5: Only the winner (ex: pred 2x0 → real 3x2)
    return SCORE_TYPES.WINNER_ONLY;
  }

  // Wrong winner — Rule 6: exact goals of one team (ex: pred 3x0 → real 0x0)
  if (predHome === realHome || predAway === realAway) {
    return SCORE_TYPES.ONE_TEAM_GOALS;
  }

  // Rule 7: Nothing
  return SCORE_TYPES.NONE;
}
