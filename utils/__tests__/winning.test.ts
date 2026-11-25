import {Game, Round} from '../../types/game';
import {findWinningTeam} from '../scoring';

function game(rounds: Round[]): Game {
  return {
    id: 'game',
    timestamp: 0,
    teams: [
      {id: 'a', name: 'A', players: []},
      {id: 'b', name: 'B', players: []},
    ],
    rounds,
    cardImageIndex: 0,
    winningScore: 1500,
    version: 1,
  };
}
const regular = (
  bid: number,
  bidWinner = 'a',
  meld = {},
  trickPoints = {a: 0, b: 250},
): Round => ({
  id: 'round',
  timestamp: 0,
  bidWinner,
  bid,
  meld,
  trickPoints,
  moonShotAttempted: false,
});

it('wins at 1500 total points', () => {
  expect(
    findWinningTeam(game([regular(1500, 'a', {a: 1250}, {a: 250, b: 0})])),
  ).toEqual({id: 'a', name: 'A', score: 1500});
});

it('wins with a lead above 1500 even below the total-score target', () => {
  expect(findWinningTeam(game([regular(1500)]))).toEqual({
    id: 'b',
    name: 'B',
    score: 250,
  });
});

it('does not end the game when the lead is only 1490', () => {
  expect(findWinningTeam(game([regular(1240)]))).toBeNull();
});

it('checks the other team after a failed moon shot, including an exact 1500 lead', () => {
  expect(
    findWinningTeam(
      game([
        {...regular(250), moonShotAttempted: true, moonShotSuccessful: false},
      ]),
    ),
  ).toEqual({id: 'b', name: 'B', score: 0});
});

it('uses the same total-score rule after a successful moon shot', () => {
  expect(
    findWinningTeam(
      game([
        {...regular(250), moonShotAttempted: true, moonShotSuccessful: true},
      ]),
    ),
  ).toEqual({id: 'a', name: 'A', score: 1500});
});

it('does not award a win just for completing a moon shot if neither threshold is reached', () => {
  expect(
    findWinningTeam(
      game([
        regular(1000),
        {...regular(250), moonShotAttempted: true, moonShotSuccessful: true},
      ]),
    ),
  ).toBeNull();
});

it('continues a tied game even when both teams have reached 1500', () => {
  const round = regular(250, 'a', {a: 625, b: 625}, {a: 125, b: 125});
  expect(findWinningTeam(game([round, {...round, id: 'second'}]))).toBeNull();
});
