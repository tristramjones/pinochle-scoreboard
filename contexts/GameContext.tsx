import {router} from 'expo-router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {Alert} from 'react-native';
import {Game, GameSettings, Round, Team} from '../types/game';
import {calculateTeamScore} from '../utils/scoring';
import * as Storage from '../utils/storage';

interface GameContextType {
  currentGame: Game | null;
  startNewGame: (settings: GameSettings) => Promise<void>;
  addRound: (round: Omit<Round, 'id' | 'timestamp'>) => Promise<void>;
  endGame: (finalGameState?: Game) => Promise<void>;
}

export const GameContext = createContext<GameContextType | undefined>(
  undefined,
);

export function GameProvider({children}: {children: React.ReactNode}) {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [shouldNavigateToVictory, setShouldNavigateToVictory] = useState(false);

  useEffect(() => {
    if (shouldNavigateToVictory) {
      router.replace('/games/victory');
      setShouldNavigateToVictory(false);
    }
  }, [shouldNavigateToVictory]);

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
      const teams: Team[] = settings.teamNames.map((name, index) => ({
        id: `team-${index + 1}`,
        name,
        players: [], // Empty players array since we don't use it
      }));

      const newGame: Game = {
        id: `game-${Date.now()}`,
        teams,
        rounds: [],
        winningScore: 1500,
        timestamp: Date.now(),
        cardImageIndex: Math.floor(Math.random() * 4), // Randomly assign one of our 4 card images
      };

      await Storage.setCurrentGame(newGame);
      setCurrentGame(newGame);
    } catch (error) {
      console.error('Error starting new game:', error);
      throw error;
    }
  }, []);

  const endGame = useCallback(
    async (finalGameState?: Game) => {
      try {
        const gameToEnd = finalGameState || currentGame;
        if (!gameToEnd) return;

        // First add to history
        await Storage.addGameToHistory(gameToEnd);
        // Then clear current game
        await Storage.setCurrentGame(null);
        // Finally update state
        setCurrentGame(null);
      } catch (error) {
        console.error('Error ending game:', error);
        Alert.alert('Error', 'Failed to end game. Please try again.');
      }
    },
    [currentGame],
  );

  const addRound = useCallback(
    async (roundData: Omit<Round, 'id' | 'timestamp'>) => {
      if (!currentGame) return;

      try {
        const newRound: Round = {
          ...roundData,
          id: `round-${Date.now()}`,
          timestamp: Date.now(),
        };

        const updatedGame = {
          ...currentGame,
          rounds: [...currentGame.rounds, newRound],
        };

        // Calculate if this round resulted in a win
        let gameIsOver = false;
        if (roundData.moonShotAttempted) {
          // For moon shots, check if the bidding team's total score is >= 1500
          const bidTeamScore = calculateTeamScore(
            updatedGame,
            roundData.bidWinner,
          );
          gameIsOver = bidTeamScore >= 1500;
        } else {
          // For regular rounds, check if any team's total score is >= 1500
          gameIsOver = updatedGame.teams.some(
            team => calculateTeamScore(updatedGame, team.id) >= 1500,
          );
        }

        if (gameIsOver) {
          // Save to history first
          await Storage.addGameToHistory(updatedGame);
          // Clear current game
          await Storage.setCurrentGame(null);
          // Update state
          setCurrentGame(null);
          // Trigger navigation via effect
          setShouldNavigateToVictory(true);
        } else {
          // Just save the updated game
          await Storage.setCurrentGame(updatedGame);
          setCurrentGame(updatedGame);
        }
      } catch (error) {
        console.error('Error adding round:', error);
        throw error;
      }
    },
    [currentGame],
  );

  return (
    <GameContext.Provider
      value={{currentGame, startNewGame, addRound, endGame}}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
