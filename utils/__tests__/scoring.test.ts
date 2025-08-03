import {Game, Round} from '../../types/game';
import {calculateTeamScore, calculateTeamScores} from '../scoring';

describe('Scoring Utils', () => {
  let mockGame: Game;
  let team1Id: string;
  let team2Id: string;

  beforeEach(() => {
    team1Id = 'team-1';
    team2Id = 'team-2';
    mockGame = {
      id: 'game-1',
      timestamp: Date.now(),
      teams: [
        {id: team1Id, name: 'Team 1', players: []},
        {id: team2Id, name: 'Team 2', players: []},
      ],
      rounds: [],
      cardImageIndex: 0,
      winningScore: 1500,
      version: 1,
    };
  });

  describe('calculateTeamScore', () => {
    it('should return 0 for a game with no rounds', () => {
      const score = calculateTeamScore(mockGame, team1Id);
      expect(score).toBe(0);
    });

    it('should correctly calculate regular round scores', () => {
      const round: Round = {
        id: 'round-1',
        timestamp: Date.now(),
        bidWinner: team1Id,
        bid: 250,
        meld: {[team1Id]: 100, [team2Id]: 50},
        trickPoints: {[team1Id]: 150, [team2Id]: 100},
        moonShotAttempted: false,
      };
      mockGame.rounds = [round];

      expect(calculateTeamScore(mockGame, team1Id)).toBe(250); // 100 meld + 150 tricks
      expect(calculateTeamScore(mockGame, team2Id)).toBe(150); // 50 meld + 100 tricks
    });

    it('should subtract bid amount when team fails to make bid', () => {
      const round: Round = {
        id: 'round-1',
        timestamp: Date.now(),
        bidWinner: team1Id,
        bid: 250,
        meld: {[team1Id]: 100, [team2Id]: 50},
        trickPoints: {[team1Id]: 100, [team2Id]: 150}, // Only got 200 total, needed 250
        moonShotAttempted: false,
      };
      mockGame.rounds = [round];

      expect(calculateTeamScore(mockGame, team1Id)).toBe(-250); // Failed bid, lose 250
      expect(calculateTeamScore(mockGame, team2Id)).toBe(200); // 50 meld + 150 tricks
    });

    it('should correctly handle moon shot rounds', () => {
      const round: Round = {
        id: 'round-1',
        timestamp: Date.now(),
        bidWinner: team1Id,
        bid: 250,
        meld: {[team1Id]: 0, [team2Id]: 0},
        trickPoints: {[team1Id]: 0, [team2Id]: 0}, // Points don't matter for moon shots
        moonShotAttempted: true,
        moonShotSuccessful: true,
      };
      mockGame.rounds = [round];

      expect(calculateTeamScore(mockGame, team1Id)).toBe(1500);
      expect(calculateTeamScore(mockGame, team2Id)).toBe(0);
    });

    it('should correctly handle failed moon shots', () => {
      const round: Round = {
        id: 'round-1',
        timestamp: Date.now(),
        bidWinner: team1Id,
        bid: 250,
        meld: {[team1Id]: 0, [team2Id]: 0},
        trickPoints: {[team1Id]: 0, [team2Id]: 0}, // Points don't matter for moon shots
        moonShotAttempted: true,
        moonShotSuccessful: false,
      };
      mockGame.rounds = [round];

      expect(calculateTeamScore(mockGame, team1Id)).toBe(-1500);
      expect(calculateTeamScore(mockGame, team2Id)).toBe(0);
    });

    it('should accumulate scores across multiple rounds', () => {
      const rounds: Round[] = [
        {
          id: 'round-1',
          timestamp: Date.now(),
          bidWinner: team1Id,
          bid: 250,
          meld: {[team1Id]: 100, [team2Id]: 50},
          trickPoints: {[team1Id]: 150, [team2Id]: 100},
          moonShotAttempted: false,
        },
        {
          id: 'round-2',
          timestamp: Date.now(),
          bidWinner: team2Id,
          bid: 300,
          meld: {[team1Id]: 75, [team2Id]: 125},
          trickPoints: {[team1Id]: 100, [team2Id]: 150},
          moonShotAttempted: false,
        },
      ];
      mockGame.rounds = rounds;

      expect(calculateTeamScore(mockGame, team1Id)).toBe(425); // Round 1: 250 + Round 2: 175
      expect(calculateTeamScore(mockGame, team2Id)).toBe(425); // Round 1: 150 + Round 2: 275
    });

    it('should handle a mix of regular and moon shot rounds', () => {
      const rounds: Round[] = [
        {
          id: 'round-1',
          timestamp: Date.now(),
          bidWinner: team1Id,
          bid: 250,
          meld: {[team1Id]: 100, [team2Id]: 50},
          trickPoints: {[team1Id]: 150, [team2Id]: 100},
          moonShotAttempted: false,
        },
        {
          id: 'round-2',
          timestamp: Date.now(),
          bidWinner: team2Id,
          bid: 250,
          meld: {[team1Id]: 0, [team2Id]: 0},
          trickPoints: {[team1Id]: 0, [team2Id]: 0}, // Points don't matter for moon shots
          moonShotAttempted: true,
          moonShotSuccessful: true,
        },
      ];
      mockGame.rounds = rounds;

      expect(calculateTeamScore(mockGame, team1Id)).toBe(250); // Regular round only
      expect(calculateTeamScore(mockGame, team2Id)).toBe(1650); // Regular round + moon shot
    });
  });

  describe('calculateTeamScores', () => {
    it('should return scores for all teams', () => {
      const round: Round = {
        id: 'round-1',
        timestamp: Date.now(),
        bidWinner: team1Id,
        bid: 250,
        meld: {[team1Id]: 100, [team2Id]: 50},
        trickPoints: {[team1Id]: 150, [team2Id]: 100},
        moonShotAttempted: false,
      };
      mockGame.rounds = [round];

      const scores = calculateTeamScores(mockGame);
      expect(scores).toEqual({
        [team1Id]: 250,
        [team2Id]: 150,
      });
    });

    it('should handle games with no rounds', () => {
      const scores = calculateTeamScores(mockGame);
      expect(scores).toEqual({
        [team1Id]: 0,
        [team2Id]: 0,
      });
    });
  });
});
