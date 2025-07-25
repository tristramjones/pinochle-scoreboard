import {useRouter} from 'expo-router';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import {Game, GameError, Round, RoundData, Team} from '../types/game';
import {calculateTeamScore} from '../utils/scoring';
import * as Storage from '../utils/storage';

interface GameState {
  currentGame: Game | null;
  isLoading: boolean;
  error: Error | null;
}

interface GameContextValue extends GameState {
  startNewGame: (params: {teamNames: string[]}) => Promise<void>;
  addRound: (roundData: RoundData) => Promise<void>;
  endGame: () => Promise<void>;
  clearError: () => void;
}

type GameAction =
  | {type: 'SET_LOADING'}
  | {type: 'SET_ERROR'; payload: Error}
  | {type: 'CLEAR_ERROR'}
  | {type: 'SET_GAME'; payload: Game | null}
  | {type: 'ADD_ROUND'; payload: Round}
  | {type: 'END_GAME'};

const initialState: GameState = {
  currentGame: null,
  isLoading: false,
  error: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_LOADING':
      return {...state, isLoading: true, error: null};
    case 'SET_ERROR':
      return {...state, isLoading: false, error: action.payload};
    case 'CLEAR_ERROR':
      return {...state, error: null};
    case 'SET_GAME':
      return {
        ...state,
        currentGame: action.payload,
        isLoading: false,
        error: null,
      };
    case 'ADD_ROUND':
      if (!state.currentGame) {
        return state;
      }
      return {
        ...state,
        currentGame: {
          ...state.currentGame,
          rounds: [...state.currentGame.rounds, action.payload],
        },
        isLoading: false,
      };
    case 'END_GAME':
      return {...state, currentGame: null, isLoading: false};
    default:
      return state;
  }
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({children}: PropsWithChildren) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const router = useRouter();

  // Load current game on mount
  useEffect(() => {
    const loadCurrentGame = async () => {
      try {
        dispatch({type: 'SET_LOADING'});
        const game = await Storage.getCurrentGame();
        dispatch({type: 'SET_GAME', payload: game});
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error ? error : new Error('Failed to load game'),
        });
      }
    };

    loadCurrentGame();
  }, []);

  const startNewGame = useCallback(
    async ({teamNames}: {teamNames: string[]}) => {
      try {
        dispatch({type: 'SET_LOADING'});

        const teams: Team[] = teamNames.map(name => ({
          id: `team-${Date.now()}-${Math.random()}`,
          name,
          players: [],
        }));

        const newGame: Game = {
          id: `game-${Date.now()}`,
          timestamp: Date.now(),
          teams,
          rounds: [],
          cardImageIndex: Math.floor(Math.random() * 24),
          winningScore: 1500,
          version: 1,
        };

        await Storage.saveCurrentGame(newGame);
        dispatch({type: 'SET_GAME', payload: newGame});
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error ? error : new Error('Failed to start game'),
        });
        throw error;
      }
    },
    [],
  );

  const addRound = useCallback(
    async (roundData: RoundData) => {
      if (!state.currentGame) {
        throw new GameError('No current game');
      }

      try {
        dispatch({type: 'SET_LOADING'});

        const newRound: Round = {
          ...roundData,
          id: `round-${Date.now()}`,
          timestamp: Date.now(),
        };

        const updatedGame = {
          ...state.currentGame,
          rounds: [...state.currentGame.rounds, newRound],
        };

        let gameIsOver = false;
        if (roundData.moonShotAttempted) {
          const bidTeamScore = calculateTeamScore(
            updatedGame,
            roundData.bidWinner,
          );
          gameIsOver = bidTeamScore >= updatedGame.winningScore;
        } else {
          const teamScores = updatedGame.teams.map(team => ({
            teamId: team.id,
            score: calculateTeamScore(updatedGame, team.id),
          }));
          gameIsOver = teamScores.some(
            ({score}) => score >= updatedGame.winningScore,
          );
        }

        // Save the updated game first
        await Storage.saveCurrentGame(updatedGame);
        dispatch({type: 'SET_GAME', payload: updatedGame});

        if (gameIsOver) {
          // Save to history before ending the game
          await Storage.saveGameHistory([
            ...(await Storage.getGameHistory()),
            updatedGame,
          ]);

          // Clear current game
          await Storage.saveCurrentGame(null);
          dispatch({type: 'END_GAME'});

          // Navigate after all state updates are complete
          setTimeout(() => {
            router.replace('/games/victory');
          }, 0);
        } else {
          router.back();
        }
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error ? error : new Error('Failed to add round'),
        });
        throw error;
      }
    },
    [state.currentGame, router],
  );

  const endGame = useCallback(async () => {
    if (!state.currentGame) return;

    try {
      dispatch({type: 'SET_LOADING'});
      await Storage.saveGameHistory([
        ...(await Storage.getGameHistory()),
        state.currentGame,
      ]);
      dispatch({type: 'END_GAME'});
      await Storage.saveCurrentGame(null);
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error : new Error('Failed to end game'),
      });
      throw error;
    }
  }, [state.currentGame]);

  const clearError = useCallback(() => {
    dispatch({type: 'CLEAR_ERROR'});
  }, []);

  return (
    <GameContext.Provider
      value={{
        ...state,
        startNewGame,
        addRound,
        endGame,
        clearError,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
