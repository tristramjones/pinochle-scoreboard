import AsyncStorage from '@react-native-async-storage/async-storage';
import {Game, StorageError} from '../../types/game';
import * as Storage from '../storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Silence console logs/warnings/errors during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

// Create a type for invalid game data
type InvalidGame = Partial<Game> & {
  id: string;
  timestamp: number;
};

describe('Storage Utils', () => {
  let mockGame: Game;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.resetAllMocks();

    mockGame = {
      id: 'game-1',
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
  });

  describe('saveCurrentGame', () => {
    it('should save a valid game', async () => {
      await Storage.saveCurrentGame(mockGame);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'pinochle_current_game',
        JSON.stringify(mockGame),
      );
    });

    it('should save null to clear the current game', async () => {
      await Storage.saveCurrentGame(null);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'pinochle_current_game',
        JSON.stringify(null),
      );
    });

    it('should throw StorageError for invalid game data', async () => {
      // Create an invalid game by omitting required fields
      const invalidGame: InvalidGame = {
        id: mockGame.id,
        timestamp: mockGame.timestamp,
        winningScore: mockGame.winningScore,
        version: mockGame.version,
        rounds: [],
        // teams is missing, making it invalid
      };
      await expect(
        Storage.saveCurrentGame(invalidGame as unknown as Game),
      ).rejects.toThrow('Invalid game data');
    });
  });

  describe('getCurrentGame', () => {
    it('should return null when no game is stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const result = await Storage.getCurrentGame();
      expect(result).toBeNull();
    });

    it('should return a valid game', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockGame),
      );
      const result = await Storage.getCurrentGame();
      expect(result).toEqual(mockGame);
    });

    it('should throw StorageError for invalid stored data', async () => {
      // Create an invalid game by omitting required fields
      const invalidGame: InvalidGame = {
        id: mockGame.id,
        timestamp: mockGame.timestamp,
        winningScore: mockGame.winningScore,
        version: mockGame.version,
        rounds: [],
        // teams is missing, making it invalid
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(invalidGame),
      );
      await expect(Storage.getCurrentGame()).rejects.toThrow(
        'Invalid game data',
      );
    });

    it('should migrate old game data', async () => {
      // Create an old game format by omitting version-specific fields
      const {version, cardImageIndex, ...oldGame} = mockGame;
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(oldGame),
      );
      const result = await Storage.getCurrentGame();
      expect(result?.cardImageIndex).toBeDefined();
      expect(result?.version).toBe(1);
    });
  });

  describe('saveGameHistory', () => {
    it('should save valid games to history', async () => {
      const games = [mockGame];
      await Storage.saveGameHistory(games);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'pinochle_game_history',
        JSON.stringify(games),
      );
    });

    it('should throw StorageError for invalid games in history', async () => {
      const invalidGame: InvalidGame = {
        id: mockGame.id,
        timestamp: mockGame.timestamp,
        winningScore: mockGame.winningScore,
        version: mockGame.version,
        rounds: [],
        // teams is missing, making it invalid
      };
      await expect(
        Storage.saveGameHistory([invalidGame as unknown as Game]),
      ).rejects.toThrow('Invalid game data');
    });
  });

  describe('getGameHistory', () => {
    it('should return empty array when no history exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const result = await Storage.getGameHistory();
      expect(result).toEqual([]);
    });

    it('should return array of valid games', async () => {
      const games = [mockGame];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(games),
      );
      const result = await Storage.getGameHistory();
      expect(result).toEqual(games);
    });

    it('should throw StorageError for invalid history data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');
      await expect(Storage.getGameHistory()).rejects.toThrow(StorageError);
    });

    it('should migrate old games in history', async () => {
      const {version, cardImageIndex, ...oldGame} = mockGame;
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([oldGame]),
      );
      const result = await Storage.getGameHistory();
      expect(result[0].cardImageIndex).toBeDefined();
      expect(result[0].version).toBe(1);
    });
  });

  describe('backupData', () => {
    it('should create backup with current game and history', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(null) // no new library
        .mockResolvedValueOnce(JSON.stringify(mockGame)) // current game
        .mockResolvedValueOnce(JSON.stringify([mockGame])); // history

      await Storage.backupData();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'pinochle_data_backup',
        expect.stringContaining('"version":1'),
      );
    });

    it('should handle missing current game', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(null) // no new library
        .mockResolvedValueOnce(null) // no current game
        .mockResolvedValueOnce(JSON.stringify([mockGame])); // history

      await Storage.backupData();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'pinochle_data_backup',
        expect.stringContaining('"currentGame":null'),
      );
    });
  });

  describe('restoreFromBackup', () => {
    it('should restore valid backup data', async () => {
      const backup = {
        timestamp: Date.now(),
        version: 1,
        currentGame: mockGame,
        gameHistory: [mockGame],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(backup),
      );

      const result = await Storage.restoreFromBackup();
      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1); // one atomic library restore
    });

    it('should handle missing backup data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const result = await Storage.restoreFromBackup();
      expect(result).toBe(false);
    });

    it('should migrate backup data if needed', async () => {
      const oldBackup = {
        timestamp: Date.now(),
        version: 0,
        currentGame: {...mockGame, version: undefined},
        gameHistory: [{...mockGame, version: undefined}],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(oldBackup),
      );

      await Storage.restoreFromBackup();

      // Check that the migrated data was saved
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'pinochle_library_v2',
        expect.stringContaining('"version":1'),
      );
    });
  });

  describe('multi-game storage compatibility', () => {
    const library = () => ({
      activeGames: [mockGame, {...mockGame, id: 'second'}],
      history: [],
      selectedId: mockGame.id,
    });

    it('backs up all ongoing games and the selection', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(library()),
      );
      await Storage.backupData();
      const backup = JSON.parse(
        (AsyncStorage.setItem as jest.Mock).mock.calls[0][1],
      );
      expect(backup.version).toBe(2);
      expect(backup.library).toEqual(library());
    });

    it('restores the whole library with one write', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({version: 2, library: library()}),
      );
      await expect(Storage.restoreFromBackup()).resolves.toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'pinochle_library_v2',
        JSON.stringify(library()),
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it('does not overwrite games with an invalid backup', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({version: 2, library: {activeGames: []}}),
      );
      await expect(Storage.restoreFromBackup()).rejects.toThrow(
        'Invalid backup library',
      );
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('clears the new library along with legacy game keys', async () => {
      await Storage.clearStorage();
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(
        expect.arrayContaining(['pinochle_library_v2']),
      );
    });
  });

  describe('clearStorage', () => {
    it('should clear all storage', async () => {
      await Storage.clearStorage();
      expect(AsyncStorage.multiRemove).toHaveBeenCalled();
    });

    it('should throw StorageError if clear fails', async () => {
      (AsyncStorage.multiRemove as jest.Mock).mockRejectedValue(
        new Error('Failed'),
      );
      await expect(Storage.clearStorage()).rejects.toThrow(StorageError);
    });
  });
});
