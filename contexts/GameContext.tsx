import {NEW_GAME_CARD_INDICES} from '../constants/Cards';
import {useRouter} from 'expo-router';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Game, RoundData} from '../types/game';
import {findWinningTeam} from '../utils/scoring';
import {
  closeGame,
  removeCompletedGame,
  saveLibraryAfterDeletion,
  GameLibrary,
  loadLibrary,
  saveLibrary,
} from '../utils/library';

interface GameContextValue {
  currentGame: Game | null;
  activeGames: Game[];
  completedGames: Game[];
  isLoading: boolean;
  error: Error | null;
  startNewGame: (params: {teamNames: string[]}) => Promise<void>;
  selectGame: (id: string) => Promise<void>;
  addRound: (round: RoundData) => Promise<void>;
  endGame: () => Promise<void>;
  deleteGame: () => Promise<void>;
  deleteCompletedGame: (id: string) => Promise<void>;
  isReady: boolean;
  retryLoad: () => void;
}
const GameContext = createContext<GameContextValue | null>(null);
const empty: GameLibrary = {activeGames: [], history: [], selectedId: null};

export function GameProvider({children}: PropsWithChildren) {
  const router = useRouter();
  const [library, setLibrary] = useState(empty);
  const saved = useRef(empty);
  const busy = useRef(false);
  const ready = useRef(false);
  const [isReady, setReady] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    loadLibrary()
      .then(data => {
        if (!active) return;
        saved.current = data;
        ready.current = true;
        setLibrary(data);
        setReady(true);
        setError(null);
      })
      .catch(err => {
        if (active)
          setError(
            err instanceof Error
              ? err
              : new Error('Failed to load saved games'),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  const retryLoad = () => {
    setLoading(true);
    setError(null);
    setLoadAttempt(attempt => attempt + 1);
  };

  const mutate = useCallback(
    async (
      change: (data: GameLibrary) => GameLibrary,
      persist: (data: GameLibrary) => Promise<void> = saveLibrary,
    ) => {
      if (!ready.current) throw new Error('Saved games are still loading');
      if (busy.current) throw new Error('Please wait for the current save');
      busy.current = true;
      setLoading(true);
      try {
        const next = change(saved.current);
        await persist(next);
        saved.current = next;
        setLibrary(next);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to save game'));
        throw err;
      } finally {
        busy.current = false;
        setLoading(false);
      }
    },
    [],
  );

  const selectGame = async (id: string) => {
    await mutate(data => {
      if (!data.activeGames.some(g => g.id === id))
        throw new Error('Game not found');
      return {...data, selectedId: id};
    });
  };
  const startNewGame = async ({teamNames}: {teamNames: string[]}) => {
    const game: Game = {
      id: `game-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      teams: teamNames.map((name, index) => ({
        id: `team-${index}`,
        name,
        players: [],
      })),
      rounds: [],
      cardImageIndex:
        NEW_GAME_CARD_INDICES[
          Math.floor(Math.random() * NEW_GAME_CARD_INDICES.length)
        ],
      winningScore: 1500,
      version: 1,
    };
    await mutate(data => ({
      ...data,
      activeGames: [...data.activeGames, game],
      selectedId: game.id,
    }));
  };
  const addRound = async (round: RoundData) => {
    let winner: {name: string; score: number} | undefined;
    await mutate(data => {
      const game = data.activeGames.find(g => g.id === data.selectedId);
      if (!game) throw new Error('No game selected');
      const updated = {
        ...game,
        rounds: [
          ...game.rounds,
          {...round, id: `round-${Date.now()}`, timestamp: Date.now()},
        ],
      };
      const best = findWinningTeam(updated);
      if (best) {
        winner = best;
        return closeGame(data, updated, true);
      }
      return {
        ...data,
        activeGames: data.activeGames.map(g =>
          g.id === updated.id ? updated : g,
        ),
      };
    });
    if (winner)
      router.replace({
        pathname: '/games/victory',
        params: {teamName: winner.name, score: String(winner.score)},
      });
    else router.back();
  };
  const finish = async (archive: boolean) => {
    await mutate(data => {
      const game = data.activeGames.find(g => g.id === data.selectedId);
      if (!game) throw new Error('No game selected');
      return closeGame(
        data,
        archive ? {...game, endedEarly: true} : game,
        archive,
      );
    });
    router.replace('/games');
  };

  const deleteCompletedGame = async (id: string) => {
    await mutate(
      data => removeCompletedGame(data, id),
      data => saveLibraryAfterDeletion(data, id),
    );
    router.replace('/games');
  };

  return (
    <GameContext.Provider
      value={{
        currentGame:
          library.activeGames.find(g => g.id === library.selectedId) ?? null,
        activeGames: library.activeGames,
        completedGames: library.history,
        isLoading,
        error,
        startNewGame,
        selectGame,
        addRound,
        endGame: () => finish(true),
        deleteGame: () => finish(false),
        deleteCompletedGame,
        isReady,
        retryLoad,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
}
