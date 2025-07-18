import {Game} from '../types/game';

export const calculateTeamScore = (game: Game, teamId: string): number => {
  return game.rounds.reduce((total, round) => {
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
};

export const calculateTeamScores = (game: Game): {[teamId: string]: number} => {
  const scores: {[teamId: string]: number} = {};
  game.teams.forEach(team => {
    scores[team.id] = calculateTeamScore(game, team.id);
  });
  return scores;
};
