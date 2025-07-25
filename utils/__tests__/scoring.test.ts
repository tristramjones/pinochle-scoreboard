import {Game} from '../../types/game';
import {
  calculateTeamScore,
  calculateTeamScores,
  clearGameScoreCache,
} from '../scoring';

describe('Scoring Utils', () => {
  const mockGame: Game = {
    id: 'test-game',
    timestamp: Date.now(),
    teams: [
      {id: 'team-1', name: 'Team 1', players: []},
      {id: 'team-2', name: 'Team 2', players: []},
    ],
    rounds: [],
    cardImageIndex: 0,
    winningScore: 1500,
    version: 1,
  };

  beforeEach(() => {
    clearGameScoreCache(mockGame.id);
  });

  describe('calculateTeamScore', () => {
    it('should return 0 for a game with no rounds', () => {
      expect(calculateTeamScore(mockGame, 'team-1')).toBe(0);
    });

    it('should correctly calculate regular round scores', () => {
      const gameWithRound: Game = {
        ...mockGame,
        rounds: [
          {
            id: 'round-1',
            timestamp: Date.now(),
            bidWinner: 'team-1',
            bid: 300,
            meld: {'team-1': 200, 'team-2': 100},
            trickPoints: {'team-1': 150, 'team-2': 100},
            moonShotAttempted: false,
          },
        ],
      };

      // Team 1 (bid winner) made their bid (200 + 150 >= 300)
      expect(calculateTeamScore(gameWithRound, 'team-1')).toBe(350); // 200 meld + 150 tricks

      // Team 2 (non-bidder) gets their points
      expect(calculateTeamScore(gameWithRound, 'team-2')).toBe(200); // 100 meld + 100 tricks
    });

    it('should subtract bid amount when team fails to make bid', () => {
      const gameWithFailedBid: Game = {
        ...mockGame,
        rounds: [
          {
            id: 'round-1',
            timestamp: Date.now(),
            bidWinner: 'team-1',
            bid: 300,
            meld: {'team-1': 100, 'team-2': 100},
            trickPoints: {'team-1': 100, 'team-2': 150},
            moonShotAttempted: false,
          },
        ],
      };

      // Team 1 (bid winner) failed their bid (100 + 100 < 300)
      expect(calculateTeamScore(gameWithFailedBid, 'team-1')).toBe(-300);

      // Team 2 (non-bidder) gets their points
      expect(calculateTeamScore(gameWithFailedBid, 'team-2')).toBe(250);
    });

    it('should correctly handle moon shot rounds', () => {
      const gameWithMoonShot: Game = {
        ...mockGame,
        rounds: [
          {
            id: 'round-1',
            timestamp: Date.now(),
            bidWinner: 'team-1',
            bid: 400,
            meld: {'team-1': 0, 'team-2': 0},
            trickPoints: {'team-1': 1500, 'team-2': 0},
            moonShotAttempted: true,
            moonShotSuccessful: true,
          },
        ],
      };

      // Team 1 (moon shooter) succeeded
      expect(calculateTeamScore(gameWithMoonShot, 'team-1')).toBe(1500);

      // Team 2 gets nothing
      expect(calculateTeamScore(gameWithMoonShot, 'team-2')).toBe(0);
    });

    it('should correctly handle failed moon shots', () => {
      const gameWithFailedMoonShot: Game = {
        ...mockGame,
        rounds: [
          {
            id: 'round-1',
            timestamp: Date.now(),
            bidWinner: 'team-1',
            bid: 400,
            meld: {'team-1': 0, 'team-2': 0},
            trickPoints: {'team-1': -1500, 'team-2': 0},
            moonShotAttempted: true,
            moonShotSuccessful: false,
          },
        ],
      };

      // Team 1 (moon shooter) failed
      expect(calculateTeamScore(gameWithFailedMoonShot, 'team-1')).toBe(-1500);

      // Team 2 gets nothing
      expect(calculateTeamScore(gameWithFailedMoonShot, 'team-2')).toBe(0);
    });
  });

  describe('calculateTeamScores', () => {
    it('should return scores for all teams', () => {
      const gameWithRound: Game = {
        ...mockGame,
        rounds: [
          {
            id: 'round-1',
            timestamp: Date.now(),
            bidWinner: 'team-1',
            bid: 300,
            meld: {'team-1': 200, 'team-2': 100},
            trickPoints: {'team-1': 150, 'team-2': 100},
            moonShotAttempted: false,
          },
        ],
      };

      const scores = calculateTeamScores(gameWithRound);
      expect(scores).toEqual({
        'team-1': 350,
        'team-2': 200,
      });
    });
  });
});
