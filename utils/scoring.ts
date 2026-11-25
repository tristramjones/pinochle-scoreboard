import {Game, Round} from '../types/game';

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
  const totalPoints = trickPoints > 0 ? meldPoints + trickPoints : 0;

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
  return game.rounds.reduce(
    (total, round) => total + calculateRoundPoints(round, teamId),
    0,
  );
};

export const calculateTeamScores = (game: Game): {[teamId: string]: number} => {
  const scores: {[teamId: string]: number} = {};
  game.teams.forEach(team => {
    scores[team.id] = calculateTeamScore(game, team.id);
  });
  return scores;
};

/** Total-score and lead-based victories use the same rule for every round. */
export function findWinningTeam(
  game: Game,
): {id: string; name: string; score: number} | null {
  const teams = game.teams.map(team => ({
    ...team,
    score: calculateTeamScore(game, team.id),
  }));
  const ranked = teams.sort((a, b) => b.score - a.score);
  const leader = ranked[0];
  if (!leader) return null;
  const opponent = ranked[1];
  if (opponent?.score === leader.score) return null;
  if (
    leader.score >= game.winningScore ||
    (opponent && leader.score - opponent.score >= game.winningScore)
  ) {
    return {id: leader.id, name: leader.name, score: leader.score};
  }
  return null;
}
