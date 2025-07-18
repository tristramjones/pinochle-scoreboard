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

        // Check if any team has won
        const winningTeam = updatedGame.teams.find(team => {
          const score = calculateTeamScore(updatedGame, team.id);
          return score >= 1500;
        });

        if (winningTeam) {
          // If there's a winning team, save the final state but don't update current game
          await Storage.setCurrentGame(updatedGame);
          // Give time for the victory screen to show, then end the game
          setTimeout(() => {
            endGame(updatedGame).catch(error => {
              console.error('Error ending game after victory:', error);
              Alert.alert('Error', 'Failed to end game. Please try again.');
            });
          }, 3500);
        } else {
          // If no winner, update normally
          await Storage.setCurrentGame(updatedGame);
          setCurrentGame(updatedGame);
        }
      } catch (error) {
        console.error('Error adding round:', error);
        Alert.alert('Error', 'Failed to add round. Please try again.');
      }
    },
    [currentGame, endGame],
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
