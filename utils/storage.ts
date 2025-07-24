import AsyncStorage from '@react-native-async-storage/async-storage';
import {Game} from '../types/game';

const STORAGE_KEYS = {
  CURRENT_GAME: 'pinochle_current_game',
  GAME_HISTORY: 'pinochle_game_history',
};

// Helper function to ensure games have cardImageIndex
function ensureGameHasCardImage(game: Game): Game {
  if (typeof game.cardImageIndex !== 'number') {
    // Assign a random card (0-23) if one isn't assigned
    return {
      ...game,
      cardImageIndex: Math.floor(Math.random() * 24),
    };
  }
  return game;
}

export async function saveCurrentGame(game: Game | null): Promise<void> {
  try {
    if (game) {
      game = ensureGameHasCardImage(game);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(game));
  } catch (error) {
    console.error('Error saving current game:', error);
    throw error;
  }
}

export async function getCurrentGame(): Promise<Game | null> {
  try {
    const gameJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    if (!gameJson) return null;
    const game = JSON.parse(gameJson);
    return ensureGameHasCardImage(game);
  } catch (error) {
    console.error('Error getting current game:', error);
    throw error;
  }
}

export async function saveGameHistory(games: Game[]): Promise<void> {
  try {
    // Ensure all games have card images before saving
    const migratedGames = games.map(ensureGameHasCardImage);
    await AsyncStorage.setItem(
      STORAGE_KEYS.GAME_HISTORY,
      JSON.stringify(migratedGames),
    );
  } catch (error) {
    console.error('Error saving game history:', error);
    throw error;
  }
}

export async function getGameHistory(): Promise<Game[]> {
  try {
    const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
    if (!historyJson) return [];
    const games = JSON.parse(historyJson);
    // Ensure all games have card images when loading
    return games.map(ensureGameHasCardImage);
  } catch (error) {
    console.error('Error getting game history:', error);
    throw error;
  }
}

export async function clearStorage(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
}

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

// Optional: Run migration on all existing games
export async function migrateAllGames(): Promise<void> {
  try {
    // Try to restore from backup first
    await restoreFromBackup();

    // Migrate current game
    const currentGame = await getCurrentGame();
    if (currentGame) {
      await saveCurrentGame(currentGame);
    }

    // Migrate game history
    const history = await getGameHistory();
    await saveGameHistory(history);

    // Create a new backup after migration
    await backupData();

    console.log('Game migration completed successfully');
  } catch (error) {
    console.error('Error during game migration:', error);
    throw error;
  }
}
