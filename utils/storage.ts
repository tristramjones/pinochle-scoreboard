import AsyncStorage from '@react-native-async-storage/async-storage';
import {Game, StorageError, isValidGame, isValidLibrary} from '../types/game';

export const STORAGE_KEYS = {
  LIBRARY: 'pinochle_library_v2',
  CURRENT_GAME: 'pinochle_current_game',
  GAME_HISTORY: 'pinochle_game_history',
};
function migrateGame(value: unknown): Game {
  if (!value || typeof value !== 'object')
    throw new StorageError('Invalid game data');
  const migrated = {...value} as Game;
  migrated.version ??= 1;
  migrated.cardImageIndex ??= 0;
  if (!isValidGame(migrated)) throw new StorageError('Invalid game data');
  return migrated;
}

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

    return migrateGame(parsedGame);
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

    return parsedHistory.map(migrateGame);
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
      STORAGE_KEYS.LIBRARY,
      STORAGE_KEYS.CURRENT_GAME,
      STORAGE_KEYS.GAME_HISTORY,
    ]);
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw new StorageError('Failed to clear storage');
  }
}

export async function backupData(): Promise<void> {
  const libraryJson = await AsyncStorage.getItem(STORAGE_KEYS.LIBRARY);
  if (libraryJson) {
    const library: unknown = JSON.parse(libraryJson);
    if (!isValidLibrary(library))
      throw new StorageError('Invalid saved game library');
    await AsyncStorage.setItem(
      'pinochle_data_backup',
      JSON.stringify({timestamp: Date.now(), version: 2, library}),
    );
    return;
  }
  const currentGame = await getCurrentGame();
  const gameHistory = await getGameHistory();
  await AsyncStorage.setItem(
    'pinochle_data_backup',
    JSON.stringify({
      timestamp: Date.now(),
      version: 1,
      currentGame,
      gameHistory,
    }),
  );
}

export async function restoreFromBackup(): Promise<boolean> {
  const json = await AsyncStorage.getItem('pinochle_data_backup');
  if (!json) return false;
  const backup = JSON.parse(json);
  if (!backup || typeof backup !== 'object')
    throw new StorageError('Invalid backup');
  if (backup.version === 2) {
    if (!isValidLibrary(backup.library))
      throw new StorageError('Invalid backup library');
    await AsyncStorage.setItem(
      STORAGE_KEYS.LIBRARY,
      JSON.stringify(backup.library),
    );
    return true;
  }
  if (![0, 1].includes(backup.version))
    throw new StorageError('Unsupported backup version');
  const currentGame = backup.currentGame
    ? migrateGame(backup.currentGame)
    : null;
  if (!Array.isArray(backup.gameHistory))
    throw new StorageError('Invalid backup history');
  const history: Game[] = backup.gameHistory.map(migrateGame);
  const activeGames =
    currentGame && !history.some(game => game.id === currentGame.id)
      ? [currentGame]
      : [];
  const library = {
    activeGames,
    history,
    selectedId: activeGames[0]?.id ?? null,
  };
  if (!isValidLibrary(library))
    throw new StorageError('Invalid backup library');
  // Restore in one write; legacy keys remain as the migration fallback only.
  await AsyncStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(library));
  return true;
}
