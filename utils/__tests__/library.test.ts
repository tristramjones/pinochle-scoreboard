import AsyncStorage from '@react-native-async-storage/async-storage';
import {Game} from '../../types/game';
import {
  closeGame,
  loadLibrary,
  saveLibrary,
  removeCompletedGame,
  saveLibraryAfterDeletion,
} from '../library';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiSet: jest.fn(),
}));
const game = (id: string): Game => ({
  id,
  timestamp: 0,
  teams: [
    {id: 'a', name: 'A', players: []},
    {id: 'b', name: 'B', players: []},
  ],
  rounds: [],
  cardImageIndex: 0,
  winningScore: 1500,
  version: 1,
});
beforeEach(() => jest.resetAllMocks());

it('imports the previous current game and history without discarding either', async () => {
  (AsyncStorage.getItem as jest.Mock).mockImplementation(
    async key =>
      ({
        pinochle_current_game: JSON.stringify(game('active')),
        pinochle_game_history: JSON.stringify([game('old')]),
      })[key as string] ?? null,
  );
  expect(await loadLibrary()).toEqual({
    activeGames: [game('active')],
    history: [game('old')],
    selectedId: 'active',
  });
});

it('keeps multiple tables and selection after a save and reload', async () => {
  const library = {
    activeGames: [game('one'), game('two')],
    history: [],
    selectedId: 'two',
  };
  await saveLibrary(library);
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
    JSON.stringify(library),
  );
  expect(await loadLibrary()).toEqual(library);
});

it('archives only the selected game, including a game with no rounds', () => {
  const library = {
    activeGames: [game('one'), game('two')],
    history: [game('old')],
    selectedId: 'one',
  };
  const result = closeGame(library, game('one'), true);
  expect(result).toEqual({
    activeGames: [game('two')],
    history: [game('old'), game('one')],
    selectedId: null,
  });
  expect(library.activeGames).toHaveLength(2);
});

it('deletes a selected game without archiving it or affecting another table', () => {
  expect(
    closeGame(
      {activeGames: [game('one'), game('two')], history: [], selectedId: 'one'},
      game('one'),
      false,
    ),
  ).toEqual({activeGames: [game('two')], history: [], selectedId: null});
});

it('rejects malformed saved libraries rather than replacing them with empty games', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{"activeGames":[]}');
  await expect(loadLibrary()).rejects.toThrow('Invalid saved game library');
});

it('reports a failed save', async () => {
  (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Disk full'));
  await expect(
    saveLibrary({activeGames: [game('one')], history: [], selectedId: 'one'}),
  ).rejects.toThrow('Disk full');
});

it.each(['null', '{"activeGames":[null],"history":[],"selectedId":null}'])(
  'rejects invalid nested library data: %s',
  async json => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(json);
    await expect(loadLibrary()).rejects.toThrow('Invalid saved game library');
  },
);

it('clears a legacy selection when that game is already archived', async () => {
  (AsyncStorage.getItem as jest.Mock).mockImplementation(
    async key =>
      ({
        pinochle_current_game: JSON.stringify(game('old')),
        pinochle_game_history: JSON.stringify([game('old')]),
      })[key as string] ?? null,
  );
  expect(await loadLibrary()).toEqual({
    activeGames: [],
    history: [game('old')],
    selectedId: null,
  });
});

it('rejects duplicate game IDs before saving', async () => {
  await expect(
    saveLibrary({
      activeGames: [game('one'), game('one')],
      history: [],
      selectedId: 'one',
    }),
  ).rejects.toThrow('Invalid saved game library');
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});

it('deletes only the selected completed game and preserves the active selection', () => {
  const library = {
    activeGames: [game('active')],
    history: [game('deleted'), game('kept')],
    selectedId: 'active',
  };
  expect(removeCompletedGame(library, 'deleted')).toEqual({
    ...library,
    history: [game('kept')],
  });
  expect(library.history).toHaveLength(2);
});

it('removes a deleted game from persisted history, migration copies, and backups', async () => {
  const original = {
    activeGames: [game('active')],
    history: [game('deleted'), game('kept')],
    selectedId: 'active',
  };
  (AsyncStorage.getItem as jest.Mock).mockImplementation(
    async key =>
      ({
        pinochle_current_game: JSON.stringify(game('deleted')),
        pinochle_game_history: JSON.stringify(original.history),
        pinochle_data_backup: JSON.stringify({version: 2, library: original}),
      })[key as string] ?? null,
  );
  await saveLibraryAfterDeletion(
    removeCompletedGame(original, 'deleted'),
    'deleted',
  );
  const writes = Object.fromEntries(
    (AsyncStorage.multiSet as jest.Mock).mock.calls[0][0],
  );
  expect(JSON.parse(writes.pinochle_library_v2 as string).history).toEqual([
    game('kept'),
  ]);
  expect(writes.pinochle_current_game).toBe('null');
  expect(JSON.parse(writes.pinochle_game_history as string)).toEqual([
    game('kept'),
  ]);
  expect(
    JSON.parse(writes.pinochle_data_backup as string).library.history,
  ).toEqual([game('kept')]);
  expect(
    JSON.parse(writes.pinochle_data_backup as string).library.activeGames,
  ).toEqual([game('active')]);
});

it('removes the game from a legacy backup too', async () => {
  (AsyncStorage.getItem as jest.Mock).mockImplementation(async key =>
    key === 'pinochle_data_backup'
      ? JSON.stringify({
          version: 1,
          currentGame: game('deleted'),
          gameHistory: [game('deleted'), game('kept')],
        })
      : null,
  );
  await saveLibraryAfterDeletion(
    {activeGames: [], history: [game('kept')], selectedId: null},
    'deleted',
  );
  const writes = Object.fromEntries(
    (AsyncStorage.multiSet as jest.Mock).mock.calls[0][0],
  );
  expect(JSON.parse(writes.pinochle_data_backup as string)).toEqual({
    version: 1,
    currentGame: null,
    gameHistory: [game('kept')],
  });
});

it('reports a failed deletion write', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  (AsyncStorage.multiSet as jest.Mock).mockRejectedValue(
    new Error('Write failed'),
  );
  await expect(
    saveLibraryAfterDeletion(
      {activeGames: [], history: [], selectedId: null},
      'deleted',
    ),
  ).rejects.toThrow('Write failed');
});
