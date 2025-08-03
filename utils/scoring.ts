import {Game} from '../types/game';
import {Round} from '../types/round';

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

// Clear all cache entries (used for testing)
export function clearAllScoreCache() {
  scoreCache.clear();
}

export const calculateRoundPoints = (round: Round, teamId: string): number => {
  const isBidWinner = round.bidWinner === teamId;

  // Handle moon shot rounds first
  if (round.moonShotAttempted) {
    if (!isBidWinner) return 0;
    return round.moonShotSuccessful ? 1500 : -1500;
  }

  // Regular round scoring
  const meldPoints = round.meld[teamId] || 0;
  const trickPoints = round.trickPoints[teamId] || 0;
  const totalPoints = meldPoints + trickPoints;

  if (isBidWinner) {
    // If this team won the bid, they need to make at least the bid amount
    if (totalPoints >= round.bid) {
      return totalPoints; // Made the bid - get meld + tricks
    } else {
      return -round.bid; // Failed to make bid - lose the bid amount
    }
  } else {
    // Not the bid winner, gets their points if they won at least one trick
    return trickPoints > 0 ? totalPoints : 0;
  }
};

export const calculateTeamScore = (game: Game, teamId: string): number => {
  const cacheKey = createCacheKey(game, teamId);

  // Check cache first
  const cachedScore = scoreCache.get(cacheKey);
  if (cachedScore !== undefined) {
    return cachedScore;
  }

  const score = game.rounds.reduce((total, round) => {
    // Use the stored round points if available, otherwise calculate them
    const roundPoints =
      (round as unknown as Round).roundPoints?.[teamId] ??
      calculateRoundPoints({...round, roundPoints: {}} as Round, teamId);
    return total + roundPoints;
  }, 0);

  // Cache the result
  scoreCache.set(cacheKey, score);
  console.log('Final score:', score);
  return score;
};

export const calculateTeamScores = (game: Game): {[teamId: string]: number} => {
  const scores: {[teamId: string]: number} = {};
  game.teams.forEach(team => {
    scores[team.id] = calculateTeamScore(game, team.id);
  });
  return scores;
};
