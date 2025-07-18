import AsyncStorage from '@react-native-async-storage/async-storage';
import {Game} from '../types/game';

const STORAGE_KEYS = {
  CURRENT_GAME: 'pinochle_current_game',
  GAME_HISTORY: 'pinochle_game_history',
};

// Add backup functionality
export const backupData = async () => {
  try {
    const currentGame = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    const gameHistory = await AsyncStorage.getItem(STORAGE_KEYS.GAME_HISTORY);

    // Store backup with timestamp
    const backup = {
      timestamp: Date.now(),
      currentGame: currentGame ? JSON.parse(currentGame) : null,
      gameHistory: gameHistory ? JSON.parse(gameHistory) : [],
    };

    await AsyncStorage.setItem('pinochle_data_backup', JSON.stringify(backup));
    return true;
  } catch (error) {
    console.error('Error creating backup:', error);
    return false;
  }
};

// Add restore functionality
export const restoreFromBackup = async () => {
  try {
    const backupData = await AsyncStorage.getItem('pinochle_data_backup');
    if (!backupData) return false;

    const backup = JSON.parse(backupData);
    if (backup.currentGame) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_GAME,
        JSON.stringify(backup.currentGame),
      );
    }
    if (backup.gameHistory) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.GAME_HISTORY,
        JSON.stringify(backup.gameHistory),
      );
    }
    return true;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    return false;
  }
};

export const getCurrentGame = async (): Promise<Game | null> => {
  try {
    const gameData = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    return gameData ? JSON.parse(gameData) : null;
  } catch (error) {
    console.error('Error getting current game:', error);
    // Try to restore from backup
    const restored = await restoreFromBackup();
    if (restored) {
      return getCurrentGame();
    }
    return null;
  }
};

export const setCurrentGame = async (game: Game | null): Promise<void> => {
  try {
    if (game) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_GAME,
        JSON.stringify(game),
      );
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
    }
    // Create backup after successful save
    await backupData();
  } catch (error) {
    console.error('Error setting current game:', error);
    throw error;
  }
};

export const getGameHistory = async (): Promise<Game[]> => {
  try {
    const historyData = await AsyncStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
    return historyData ? JSON.parse(historyData) : [];
  } catch (error) {
    console.error('Error getting game history:', error);
    // Try to restore from backup
    const restored = await restoreFromBackup();
    if (restored) {
      return getGameHistory();
    }
    return [];
  }
};

export const saveGameHistory = async (games: Game[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.GAME_HISTORY,
      JSON.stringify(games),
    );
    // Create backup after successful save
    await backupData();
  } catch (error) {
    console.error('Error saving game history:', error);
    throw error;
  }
};

export const addGameToHistory = async (game: Game): Promise<void> => {
  try {
    const history = await getGameHistory();
    history.push(game);
    await saveGameHistory(history);
  } catch (error) {
    console.error('Error adding game to history:', error);
    throw error;
  }
};

export const deleteGamesFromHistory = async (
  gameIds: string[],
): Promise<void> => {
  try {
    const history = await getGameHistory();
    const updatedHistory = history.filter(game => !gameIds.includes(game.id));
    await saveGameHistory(updatedHistory);
  } catch (error) {
    console.error('Error deleting games from history:', error);
    throw error;
  }
};
