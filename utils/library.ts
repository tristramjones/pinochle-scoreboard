import AsyncStorage from '@react-native-async-storage/async-storage';
import {Game, GameLibrary, StorageError, isValidLibrary} from '../types/game';
import {getCurrentGame, getGameHistory, STORAGE_KEYS} from './storage';

export type {GameLibrary} from '../types/game';

export async function loadLibrary(): Promise<GameLibrary> {
  const json = await AsyncStorage.getItem(STORAGE_KEYS.LIBRARY);
  if (!json) {
    const current = await getCurrentGame();
    const history = await getGameHistory();
    const activeGames =
      current && !history.some(g => g.id === current.id) ? [current] : [];
    const library = {
      activeGames,
      history,
      selectedId: activeGames[0]?.id ?? null,
    };
    if (!isValidLibrary(library))
      throw new StorageError('Invalid saved game library');
    return library;
  }
  const data = JSON.parse(json);
  if (!isValidLibrary(data)) {
    throw new StorageError('Invalid saved game library');
  }
  return data;
}

// Keep games and history in one write so ending a game cannot lose another table.
export async function saveLibrary(library: GameLibrary): Promise<void> {
  if (!isValidLibrary(library))
    throw new StorageError('Invalid saved game library');
  await AsyncStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(library));
}

export function closeGame(
  library: GameLibrary,
  game: Game,
  archive: boolean,
): GameLibrary {
  return {
    activeGames: library.activeGames.filter(g => g.id !== game.id),
    history: archive
      ? [...library.history.filter(g => g.id !== game.id), game]
      : library.history,
    selectedId: library.selectedId === game.id ? null : library.selectedId,
  };
}

export function removeCompletedGame(
  library: GameLibrary,
  id: string,
): GameLibrary {
  if (!library.history.some(game => game.id === id))
    throw new StorageError('Completed game not found');
  return {...library, history: library.history.filter(game => game.id !== id)};
}

// Also remove retained migration and backup copies so a deleted game cannot reappear.
export async function saveLibraryAfterDeletion(
  library: GameLibrary,
  id: string,
): Promise<void> {
  if (!isValidLibrary(library))
    throw new StorageError('Invalid saved game library');
  const keys = [
    STORAGE_KEYS.CURRENT_GAME,
    STORAGE_KEYS.GAME_HISTORY,
    'pinochle_data_backup',
  ];
  const copies = await Promise.all(keys.map(key => AsyncStorage.getItem(key)));
  const writes: [string, string][] = [
    [STORAGE_KEYS.LIBRARY, JSON.stringify(library)],
  ];
  copies.forEach((json, index) => {
    if (!json) return;
    const value = JSON.parse(json);
    if (index === 0) {
      if (value?.id === id) writes.push([keys[index], 'null']);
    } else if (index === 1) {
      if (!Array.isArray(value))
        throw new StorageError('Invalid retained history');
      writes.push([
        keys[index],
        JSON.stringify(value.filter(game => game.id !== id)),
      ]);
    } else {
      if (!value || typeof value !== 'object')
        throw new StorageError('Invalid backup');
      if (value.currentGame?.id === id) value.currentGame = null;
      if (Array.isArray(value.gameHistory))
        value.gameHistory = value.gameHistory.filter(
          (game: Game) => game.id !== id,
        );
      if (value.library) {
        if (!isValidLibrary(value.library))
          throw new StorageError('Invalid backup library');
        value.library.activeGames = value.library.activeGames.filter(
          (game: Game) => game.id !== id,
        );
        value.library.history = value.library.history.filter(
          (game: Game) => game.id !== id,
        );
        if (value.library.selectedId === id) value.library.selectedId = null;
      }
      writes.push([keys[index], JSON.stringify(value)]);
    }
  });
  await AsyncStorage.multiSet(writes);
}
