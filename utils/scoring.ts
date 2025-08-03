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

// Clear all cache entries (used for testing)
export function clearAllScoreCache() {
  scoreCache.clear();
}

export const calculateTeamScore = (game: Game, teamId: string): number => {
  const cacheKey = createCacheKey(game, teamId);

  // Check cache first
  const cachedScore = scoreCache.get(cacheKey);
  if (cachedScore !== undefined) {
    return cachedScore;
  }

  console.log('\nCalculating score for team:', teamId);
  const score = game.rounds.reduce((total, round) => {
    console.log(`\nRound:`, round);
    const isBidWinner = round.bidWinner === teamId;

    // Handle moon shot rounds first
    if (round.moonShotAttempted) {
      if (!isBidWinner) {
        console.log('Not bid winner in moon shot round, getting 0 points');
        return total;
      }
      // For moon shots, we ignore meld and trick points
      const moonShotPoints = round.moonShotSuccessful ? 1500 : -1500;
      console.log('Moon shot points:', moonShotPoints);
      const newTotal = total + moonShotPoints;
      console.log('Running total (moon shot):', newTotal);
      return newTotal;
    }

    // Regular round scoring
    const meldPoints = round.meld[teamId] || 0;
    const trickPoints = round.trickPoints[teamId] || 0;
    const totalPoints = meldPoints + trickPoints;

    let roundPoints;
    if (isBidWinner) {
      // If this team won the bid, they need to make at least the bid amount
      if (totalPoints >= round.bid) {
        // Made the bid - get meld + tricks
        roundPoints = totalPoints;
        console.log('Made bid, getting points:', roundPoints);
      } else {
        // Failed to make bid - lose the bid amount
        roundPoints = -round.bid;
        console.log('Failed bid, losing points:', roundPoints);
        // For failed bids, we want to return just the negative bid amount
        return total - round.bid;
      }
    } else {
      // Not the bid winner, gets their points if they won at least one trick
      if (trickPoints > 0) {
        roundPoints = totalPoints;
        console.log('Not bid winner, getting points:', roundPoints);
      } else {
        roundPoints = 0;
        console.log('Not bid winner, no tricks won, getting 0 points');
      }
    }

    const newTotal = total + roundPoints;
    console.log('Running total:', newTotal);
    return newTotal;
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
