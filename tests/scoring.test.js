import { describe, it, expect } from 'vitest';
import { calculateScore, SCORE_TYPES } from '../src/utils/scoring';

describe('calculateScore', () => {
  // Rule 1: EXACT SCORE → 25 pts
  it('returns EXACT (25pts) for exact score match', () => {
    expect(calculateScore(2, 1, 2, 1)).toBe(SCORE_TYPES.EXACT);
    expect(calculateScore(0, 0, 0, 0)).toBe(SCORE_TYPES.EXACT);
    expect(calculateScore(3, 3, 3, 3)).toBe(SCORE_TYPES.EXACT);
  });

  // Rule 2: WINNER + WINNER'S GOALS → 15 pts
  it('returns WINNER_BOTH_GOALS (15pts) when winner and winner goals match', () => {
    // Pred 2x1 → Real 2x0: home wins, home goals match (2=2)
    expect(calculateScore(2, 1, 2, 0)).toBe(SCORE_TYPES.WINNER_BOTH_GOALS);
    // Pred 1x3 → Real 0x3: away wins, away goals match (3=3)
    expect(calculateScore(1, 3, 0, 3)).toBe(SCORE_TYPES.WINNER_BOTH_GOALS);
    // Pred 3x0 → Real 3x1: home wins, home goals match (3=3)
    expect(calculateScore(3, 0, 3, 1)).toBe(SCORE_TYPES.WINNER_BOTH_GOALS);
  });

  // Rule 3: WINNER + GOAL DIFFERENCE → 15 pts
  it('returns WINNER_GOAL_DIFF (15pts) when winner and goal diff match', () => {
    // Pred 2x1 → Real 1x0: home wins, diff=1 in both
    expect(calculateScore(2, 1, 1, 0)).toBe(SCORE_TYPES.WINNER_GOAL_DIFF);
    // Pred 3x1 → Real 2x0: home wins, diff=2 in both
    expect(calculateScore(3, 1, 2, 0)).toBe(SCORE_TYPES.WINNER_GOAL_DIFF);
    // Pred 0x2 → Real 1x3: away wins, diff=2 in both
    expect(calculateScore(0, 2, 1, 3)).toBe(SCORE_TYPES.WINNER_GOAL_DIFF);
  });

  // Rule 3 (draws): Different draw scores → 15 pts
  it('returns WINNER_GOAL_DIFF (15pts) for different draw scores', () => {
    // Pred 2x2 → Real 1x1
    expect(calculateScore(2, 2, 1, 1)).toBe(SCORE_TYPES.WINNER_GOAL_DIFF);
    // Pred 0x0 → Real 3x3
    expect(calculateScore(0, 0, 3, 3)).toBe(SCORE_TYPES.WINNER_GOAL_DIFF);
    // Pred 1x1 → Real 0x0
    expect(calculateScore(1, 1, 0, 0)).toBe(SCORE_TYPES.WINNER_GOAL_DIFF);
  });

  // Rule 4: WINNER + LOSER'S GOALS → 12 pts
  it('returns WINNER_LOSER_GOALS (12pts) when winner and loser goals match', () => {
    // Pred 2x0 → Real 3x0: home wins, away goals match (0=0)
    expect(calculateScore(2, 0, 3, 0)).toBe(SCORE_TYPES.WINNER_LOSER_GOALS);
    // Pred 1x2 → Real 1x4: away wins, home goals match (1=1)
    expect(calculateScore(1, 2, 1, 4)).toBe(SCORE_TYPES.WINNER_LOSER_GOALS);
    // Pred 3x1 → Real 4x1: home wins, away match (1=1), but diff is 2 vs 3
    expect(calculateScore(3, 1, 4, 1)).toBe(SCORE_TYPES.WINNER_LOSER_GOALS);
  });

  // Rule 5: WINNER ONLY → 6 pts
  it('returns WINNER_ONLY (6pts) when only the winner matches', () => {
    // Pred 2x0 → Real 3x2
    expect(calculateScore(2, 0, 3, 2)).toBe(SCORE_TYPES.WINNER_ONLY);
    // Pred 1x0 → Real 4x2
    expect(calculateScore(1, 0, 4, 2)).toBe(SCORE_TYPES.WINNER_ONLY);
    // Pred 0x1 → Real 2x4: away wins, diff -1≠-2, away goals 1≠4, home 0≠2
    expect(calculateScore(0, 1, 2, 4)).toBe(SCORE_TYPES.WINNER_ONLY);
  });

  // Rule 6: ONE TEAM'S GOALS → 3 pts
  it('returns ONE_TEAM_GOALS (3pts) when one team goals match but wrong winner', () => {
    // Pred 3x0 → Real 0x0: wrong winner, but away goals match (0=0)
    expect(calculateScore(3, 0, 0, 0)).toBe(SCORE_TYPES.ONE_TEAM_GOALS);
    // Pred 2x1 → Real 0x1: wrong winner, away match (1=1)
    expect(calculateScore(2, 1, 0, 1)).toBe(SCORE_TYPES.ONE_TEAM_GOALS);
    // Pred 1x0 → Real 1x2: wrong winner, home match (1=1)
    expect(calculateScore(1, 0, 1, 2)).toBe(SCORE_TYPES.ONE_TEAM_GOALS);
    // Pred 0x3 → Real 2x0: wrong winner, home match (0→2? no). Let's check:
    // pred home=0, pred away=3 → away wins. real home=2, real away=0 → home wins. Wrong winner.
    // home: 0≠2, away: 3≠0. → NONE
    expect(calculateScore(0, 3, 2, 0)).toBe(SCORE_TYPES.NONE);
    // Pred 1x3 → Real 1x0: wrong winner (away vs home), home match (1=1)
    expect(calculateScore(1, 3, 1, 0)).toBe(SCORE_TYPES.ONE_TEAM_GOALS);
  });

  // Rule 7: NONE → 0 pts
  it('returns NONE (0pts) when nothing matches', () => {
    // Pred 3x0 → Real 0x2
    expect(calculateScore(3, 0, 0, 2)).toBe(SCORE_TYPES.NONE);
    // Pred 1x0 → Real 0x3
    expect(calculateScore(1, 0, 0, 3)).toBe(SCORE_TYPES.NONE);
    // Pred 2x1 → Real 0x3
    expect(calculateScore(2, 1, 0, 3)).toBe(SCORE_TYPES.NONE);
  });

  // Edge cases
  it('returns NONE for null inputs', () => {
    expect(calculateScore(null, 1, 2, 1)).toBe(SCORE_TYPES.NONE);
    expect(calculateScore(1, null, 2, 1)).toBe(SCORE_TYPES.NONE);
    expect(calculateScore(1, 1, null, 1)).toBe(SCORE_TYPES.NONE);
    expect(calculateScore(1, 1, 1, null)).toBe(SCORE_TYPES.NONE);
  });

  it('handles high-scoring games correctly', () => {
    // Pred 5x3 → Real 5x3 → exact
    expect(calculateScore(5, 3, 5, 3)).toBe(SCORE_TYPES.EXACT);
    // Pred 5x3 → Real 5x1 → winner + winner goals
    expect(calculateScore(5, 3, 5, 1)).toBe(SCORE_TYPES.WINNER_BOTH_GOALS);
    // Pred 5x3 → Real 4x2 → winner + diff (2=2)
    expect(calculateScore(5, 3, 4, 2)).toBe(SCORE_TYPES.WINNER_GOAL_DIFF);
  });

  // Verify mutual exclusivity and order
  it('correctly prioritizes rules in order', () => {
    // Rule 2 before Rule 3 when winner goals match AND diff matches
    // (This would be exact score, which is Rule 1)
    // Pred 3x1 → Real 3x1 → EXACT (Rule 1 takes precedence)
    expect(calculateScore(3, 1, 3, 1)).toBe(SCORE_TYPES.EXACT);

    // When winner's goals match, Rule 2 is given, not Rule 4 even if loser also matches
    // (If both match, it's exact → Rule 1)
    // So Rule 2 and Rule 4 can't conflict

    // Rule 3 before Rule 4: diff matches AND loser matches
    // Pred 3x1 → Real 2x0: diff=2, loser away pred=1≠0 → Rule 3
    expect(calculateScore(3, 1, 2, 0)).toBe(SCORE_TYPES.WINNER_GOAL_DIFF);
  });
});
