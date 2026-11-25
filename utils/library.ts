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
