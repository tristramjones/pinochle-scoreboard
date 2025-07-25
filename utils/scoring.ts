import {Game} from '../types/game';

// Cache for memoized scores
const scoreCache = new Map<string, number>();

// Create a cache key for a game and team
function createCacheKey(game: Game, teamId: string): string {
  return `${game.id}_${teamId}_${game.rounds.length}`;
}

// Clear cache entries for a specific game
export function clearGameScoreCache(gameId: string) {
  for (const key of scoreCache.keys()) {
    if (key.startsWith(gameId)) {
      scoreCache.delete(key);
    }
  }
}

export const calculateTeamScore = (game: Game, teamId: string): number => {
  const cacheKey = createCacheKey(game, teamId);

  // Check cache first
  const cachedScore = scoreCache.get(cacheKey);
  if (cachedScore !== undefined) {
    return cachedScore;
  }

  const score = game.rounds.reduce((total, round) => {
    if (round.moonShotAttempted) {
      if (round.bidWinner === teamId) {
        return total + (round.moonShotSuccessful ? 1500 : -1500);
      }
      return total;
    }

    // Get base points (meld + tricks)
    const meldPoints = round.meld[teamId] || 0;
    const trickPoints = round.trickPoints[teamId] || 0;
    const roundTotal = meldPoints + trickPoints;

    // If this team won the bid
    if (round.bidWinner === teamId) {
      // Need to make at least the bid amount in combined meld + tricks
      if (roundTotal >= round.bid) {
        // Made the bid - get meld + tricks
        return total + roundTotal;
      } else {
        // Didn't make the bid - subtract bid amount
        return total - round.bid;
      }
    } else {
      // Not the bid winner - get meld + tricks
      return total + roundTotal;
    }
  }, 0);

  // Cache the result
  scoreCache.set(cacheKey, score);
  return score;
};

export const calculateTeamScores = (game: Game): {[teamId: string]: number} => {
  const scores: {[teamId: string]: number} = {};
  game.teams.forEach(team => {
    scores[team.id] = calculateTeamScore(game, team.id);
  });
  return scores;
};
