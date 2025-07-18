import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {Alert} from 'react-native';
import {Game, GameSettings, Round} from '../types/game';
import * as Storage from '../utils/storage';

interface GameContextType {
  currentGame: Game | null;
  isLoading: boolean;
  startNewGame: (settings: GameSettings) => Promise<void>;
  addRound: (round: Omit<Round, 'id' | 'timestamp'>) => Promise<void>;
  endGame: (finalGameState?: Game) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export function GameProvider({children}: {children: React.ReactNode}) {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  // Load current game on mount
  useEffect(() => {
    const loadCurrentGame = async () => {
      try {
        const game = await Storage.getCurrentGame();
        setCurrentGame(game);
      } catch (error) {
        console.error('Error loading current game:', error);
        Alert.alert(
          'Error',
          'There was an error loading your game. Would you like to try restoring from backup?',
          [
            {
              text: 'Yes',
              onPress: async () => {
                const restored = await Storage.restoreFromBackup();
                if (restored) {
                  const game = await Storage.getCurrentGame();
                  setCurrentGame(game);
                  Alert.alert('Success', 'Game data restored from backup');
                } else {
                  Alert.alert('Error', 'Could not restore from backup');
                }
              },
            },
            {text: 'No'},
          ],
        );
      }
    };

    loadCurrentGame();
  }, []);

  const startNewGame = useCallback(async (settings: GameSettings) => {
    try {
      const teams = settings.teamNames.map((name, index) => ({
        id: `team-${index + 1}`,
        name,
      }));

      const newGame: Game = {
        id: `game-${Date.now()}`,
        teams,
        rounds: [],
        winningScore: 1500,
        timestamp: Date.now(),
      };

      await Storage.setCurrentGame(newGame);
      setCurrentGame(newGame);
    } catch (error) {
      console.error('Error starting new game:', error);
      throw error;
    }
  }, []);

  const addRound = useCallback(
    async (roundData: Round) => {
      if (!currentGame) return;

      try {
        const updatedGame = {
          ...currentGame,
          rounds: [...currentGame.rounds, roundData],
        };

        await Storage.setCurrentGame(updatedGame);
        setCurrentGame(updatedGame);
      } catch (error) {
        console.error('Error adding round:', error);
        throw error;
      }
    },
    [currentGame],
  );

  const endGame = useCallback(async (game: Game) => {
    try {
      await Storage.addGameToHistory(game);
      await Storage.setCurrentGame(null);
      setCurrentGame(null);
    } catch (error) {
      console.error('Error ending game:', error);
      throw error;
    }
  }, []);

  return (
    <GameContext.Provider
      value={{
        currentGame,
        startNewGame,
        addRound,
        endGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
