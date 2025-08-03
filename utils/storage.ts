import AsyncStorage from '@react-native-async-storage/async-storage';
import {Game, StorageError, isValidGame} from '../types/game';

const STORAGE_KEYS = {
  CURRENT_GAME: 'pinochle_current_game',
  GAME_HISTORY: 'pinochle_game_history',
};

const CURRENT_VERSION = 1;

// Helper function to check if data needs migration
function needsMigration(data: unknown): boolean {
  if (!data) return false;
  const parsed = typeof data === 'string' ? JSON.parse(data) : data;
  return !parsed.version || parsed.version < CURRENT_VERSION;
}

// Helper function to ensure games have cardImageIndex and version
function migrateGame(game: Game | null): Game | null {
  if (!game) return null;

  let updatedGame = {...game};

  // Add cardImageIndex if missing
  if (typeof updatedGame.cardImageIndex !== 'number') {
    updatedGame.cardImageIndex = Math.floor(Math.random() * 24);
  }

  // Add version if missing or outdated
  if (typeof updatedGame.version !== 'number') {
    console.log('Adding version to game data:', CURRENT_VERSION);
    updatedGame.version = CURRENT_VERSION;
  }

  // Add roundPoints to each round if missing
  updatedGame.rounds = updatedGame.rounds.map(round => {
    if (!('roundPoints' in round)) {
      const roundWithPoints = {
        ...round,
        roundPoints: {} as {[teamId: string]: number},
      };
      // Calculate points for each team
      updatedGame.teams.forEach(team => {
        const isBidWinner = round.bidWinner === team.id;
        const meldPoints = round.meld[team.id] || 0;
        const trickPoints = round.trickPoints[team.id] || 0;
        const totalPoints = meldPoints + trickPoints;

        if (round.moonShotAttempted) {
          if (isBidWinner) {
            roundWithPoints.roundPoints[team.id] = round.moonShotSuccessful
              ? 1500
              : -1500;
          } else {
            roundWithPoints.roundPoints[team.id] = 0;
          }
        } else if (isBidWinner) {
          roundWithPoints.roundPoints[team.id] =
            totalPoints >= round.bid ? totalPoints : -round.bid;
        } else {
          roundWithPoints.roundPoints[team.id] =
            trickPoints > 0 ? totalPoints : 0;
        }
      });
      return roundWithPoints;
    }
    return round;
  });

  return updatedGame;
}

export async function saveCurrentGame(game: Game | null): Promise<void> {
  try {
    if (game) {
      // Validate game before saving
      const migratedGame = migrateGame(game);
      if (!isValidGame(migratedGame)) {
        throw new StorageError('Invalid game data');
      }
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_GAME,
        JSON.stringify(migratedGame),
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

    const migratedGame = migrateGame(parsedGame);
    if (!isValidGame(migratedGame)) {
      throw new StorageError('Invalid game data in storage');
    }

    return migratedGame;
  } catch (error) {
    console.error('Error getting current game:', error);
    throw error instanceof StorageError
      ? error
      : new StorageError('Failed to get current game');
  }
};

export async function saveGameHistory(games: Game[]): Promise<void> {
  try {
    // Validate and migrate all games
    const migratedGames = games.map((game: Game) => {
      const migratedGame = migrateGame(game);
      if (!isValidGame(migratedGame)) {
        throw new StorageError('Invalid game data in history');
      }
      return migratedGame;
    });

    await AsyncStorage.setItem(
      STORAGE_KEYS.GAME_HISTORY,
      JSON.stringify(migratedGames),
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

    // Validate and migrate each game
    return parsedHistory.map((game: unknown) => {
      const migratedGame = migrateGame(game as Game);
      if (!isValidGame(migratedGame)) {
        throw new StorageError('Invalid game data in history');
      }
      return migratedGame;
    });
  } catch (error) {
    console.error('Error getting game history:', error);
    throw error instanceof StorageError
      ? error
      : new StorageError('Failed to get game history');
  }
};

export async function clearStorage(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw new StorageError('Failed to clear storage');
  }
}

// Add backup functionality
export const backupData = async (): Promise<boolean> => {
  try {
    const currentGame = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    const gameHistory = await AsyncStorage.getItem(STORAGE_KEYS.GAME_HISTORY);

    // Parse and migrate current game if needed
    let parsedCurrentGame = currentGame ? JSON.parse(currentGame) : null;
    if (parsedCurrentGame && needsMigration(parsedCurrentGame)) {
      parsedCurrentGame = migrateGame(parsedCurrentGame);
    }

    // Parse and migrate game history if needed
    let parsedGameHistory = gameHistory ? JSON.parse(gameHistory) : [];
    if (Array.isArray(parsedGameHistory)) {
      parsedGameHistory = parsedGameHistory.map((game: unknown) => {
        if (needsMigration(game)) {
          return migrateGame(game as Game);
        }
        return game;
      });
    }

    const backup = {
      timestamp: Date.now(),
      version: CURRENT_VERSION,
      currentGame: parsedCurrentGame,
      gameHistory: parsedGameHistory,
    };

    await AsyncStorage.setItem('pinochle_data_backup', JSON.stringify(backup));
    console.log('Backup created successfully with version:', CURRENT_VERSION);
    return true;
  } catch (error) {
    console.error('Error creating backup:', error);
    return false;
  }
};

// Add restore functionality
export const restoreFromBackup = async (): Promise<boolean> => {
  try {
    const backupData = await AsyncStorage.getItem('pinochle_data_backup');
    if (!backupData) return false;

    const backup = JSON.parse(backupData);

    // If backup has no version, assume it's old data that needs migration
    if (!backup.version) {
      console.log(
        'Found backup without version, assuming old data that needs migration',
      );
      backup.version = 0; // Set to 0 to trigger migration
    }

    // Log warning if versions don't match
    if (backup.version !== CURRENT_VERSION) {
      console.warn(
        `Backup version (${backup.version}) differs from current version (${CURRENT_VERSION}). Attempting migration...`,
      );
    }

    if (backup.currentGame) {
      const migratedGame = migrateGame(backup.currentGame);
      if (!isValidGame(migratedGame)) {
        throw new StorageError('Invalid game data in backup');
      }
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_GAME,
        JSON.stringify(migratedGame),
      );
    }

    if (Array.isArray(backup.gameHistory)) {
      const migratedGames = backup.gameHistory.map((game: unknown) => {
        const migratedGame = migrateGame(game as Game);
        if (!isValidGame(migratedGame)) {
          throw new StorageError('Invalid game data in backup history');
        }
        return migratedGame;
      });
      await AsyncStorage.setItem(
        STORAGE_KEYS.GAME_HISTORY,
        JSON.stringify(migratedGames),
      );
    }

    return true;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    throw error instanceof StorageError
      ? error
      : new StorageError('Failed to restore from backup');
  }
};

// Run migration on all existing games
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
    throw error instanceof StorageError
      ? error
      : new StorageError('Failed to migrate games');
  }
}
