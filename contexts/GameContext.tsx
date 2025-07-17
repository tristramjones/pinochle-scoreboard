import React, {createContext, useContext, useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {Game, GameSettings, Round, Team} from '../types/game';
import {calculateTeamScores} from '../utils/scoring';
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

export const GameProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentGame();
  }, []);

  const loadCurrentGame = async () => {
    try {
      const game = await Storage.getCurrentGame();
      console.log('Loaded current game:', game ? 'exists' : 'null');
      if (game) {
        const scores = calculateTeamScores(game);
        console.log('Current game scores:', scores);
      }
      setCurrentGame(game);
    } catch (error) {
      console.error('Error loading current game:', error);
      Alert.alert('Error', 'Failed to load game data');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewGame = async (settings: GameSettings) => {
    try {
      // First check if there's really a current game
      const existingGame = await Storage.getCurrentGame();
      console.log(
        'Starting new game, existing game:',
        existingGame ? 'exists' : 'null',
      );

      if (existingGame) {
        // Save it to history before starting new game
        await Storage.saveGameToHistory(existingGame);
        await Storage.clearCurrentGame();
      }

      const teams: Team[] = settings.teamNames.map((name, index) => ({
        id: `team-${index + 1}`,
        name,
        players: [],
      }));

      const newGame: Game = {
        id: `game-${Date.now()}`,
        teams,
        rounds: [],
        winningScore: 1500,
        timestamp: Date.now(),
      };

      await Storage.saveCurrentGame(newGame);
      console.log('New game created and saved');
      setCurrentGame(newGame);
    } catch (error) {
      console.error('Error starting new game:', error);
      Alert.alert('Error', 'Failed to start new game');
      throw error;
    }
  };

  const addRound = async (roundData: Omit<Round, 'id' | 'timestamp'>) => {
    if (!currentGame) return;

    try {
      const newRound: Round = {
        ...roundData,
        id: `round-${currentGame.rounds.length + 1}`,
        timestamp: Date.now(),
      };

      const updatedGame: Game = {
        ...currentGame,
        rounds: [...currentGame.rounds, newRound],
      };

      // Calculate scores before saving
      const teamScores = calculateTeamScores(updatedGame);
      console.log('Team scores after round:', teamScores);

      // Save the updated game first
      await Storage.saveCurrentGame(updatedGame);
      setCurrentGame(updatedGame);

      // Check if game is over
      const winningTeam = Object.entries(teamScores).find(
        ([_, score]) => score >= updatedGame.winningScore,
      );

      if (winningTeam) {
        console.log(
          'Game over - winning team:',
          winningTeam[0],
          'with score:',
          winningTeam[1],
        );
        // The game will be ended after the victory screen is shown
        // The VictoryScreen component will navigate to the games screen
        // which will trigger the useEffect in GamesScreen to reload games
        setTimeout(async () => {
          try {
            await endGame(updatedGame);
          } catch (error) {
            console.error('Error ending game:', error);
          }
        }, 3500); // Slightly longer than the victory screen duration
      }
    } catch (error) {
      console.error('Error adding round:', error);
      Alert.alert('Error', 'Failed to add round');
      throw error;
    }
  };

  const endGame = async (finalGameState?: Game) => {
    const gameToEnd = finalGameState || currentGame;
    if (!gameToEnd) {
      console.log('No game to end');
      return;
    }

    try {
      const finalScores = calculateTeamScores(gameToEnd);
      console.log('Ending game:', gameToEnd.id);
      console.log('Final scores:', finalScores);

      // Save to history first
      await Storage.saveGameToHistory(gameToEnd);
      console.log('Game saved to history');

      // Then clear current game
      await Storage.clearCurrentGame();
      console.log('Current game cleared');

      // Finally update state
      setCurrentGame(null);
      console.log('Game ended successfully');
    } catch (error) {
      console.error('Error ending game:', error);
      Alert.alert('Error', 'Failed to end game');
      throw error;
    }
  };

  return (
    <GameContext.Provider
      value={{
        currentGame,
        isLoading,
        startNewGame,
        addRound,
        endGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
