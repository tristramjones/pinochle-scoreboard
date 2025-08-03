import AsyncStorage from '@react-native-async-storage/async-storage';
import {Game, StorageError, isValidGame} from '../types/game';

const STORAGE_KEYS = {
  CURRENT_GAME: 'pinochle_current_game',
  GAME_HISTORY: 'pinochle_game_history',
};
export async function saveCurrentGame(game: Game | null): Promise<void> {
  try {
    if (game) {
      if (!isValidGame(game)) {
        throw new StorageError('Invalid game data');
      }
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_GAME,
        JSON.stringify(game),
      );
    } else {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_GAME,
        JSON.stringify(null),
      );
    }
  } catch (error) {
    console.error('Error saving current game:', error);
    throw error instanceof StorageError
      ? error
      : new StorageError('Failed to save current game');
  }
}

export const getCurrentGame = async (): Promise<Game | null> => {
  try {
    const gameJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    if (!gameJson) return null;

    const parsedGame = JSON.parse(gameJson);
    if (!parsedGame) return null;

    if (!isValidGame(parsedGame)) {
      throw new StorageError('Invalid game data in storage');
    }

    return parsedGame;
  } catch (error) {
    console.error('Error getting current game:', error);
    throw error instanceof StorageError
      ? error
      : new StorageError('Failed to get current game');
  }
};

export async function saveGameHistory(games: Game[]): Promise<void> {
  try {
    // Validate games
    games.forEach(game => {
      if (!isValidGame(game)) {
        throw new StorageError('Invalid game data in history');
      }
    });

    await AsyncStorage.setItem(
      STORAGE_KEYS.GAME_HISTORY,
      JSON.stringify(games),
    );
  } catch (error) {
    console.error('Error saving game history:', error);
    throw error instanceof StorageError
      ? error
      : new StorageError('Failed to save game history');
  }
}

export const getGameHistory = async (): Promise<Game[]> => {
  try {
    const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
    if (!historyJson) return [];

    const parsedHistory = JSON.parse(historyJson);
    if (!Array.isArray(parsedHistory)) {
      throw new StorageError('Invalid game history format');
    }

    // Validate each game
    parsedHistory.forEach((game: unknown) => {
      if (!isValidGame(game)) {
        throw new StorageError('Invalid game data in history');
      }
    });

    return parsedHistory;
  } catch (error) {
    console.error('Error getting game history:', error);
    throw error instanceof StorageError
      ? error
      : new StorageError('Failed to get game history');
  }
};

export async function clearStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CURRENT_GAME,
      STORAGE_KEYS.GAME_HISTORY,
    ]);
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw new StorageError('Failed to clear storage');
  }
}
