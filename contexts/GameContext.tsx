import {createContext, PropsWithChildren, useContext, useState} from 'react';
import {Game, Team} from '../types/game';
import * as Storage from '../utils/storage';

interface GameContextValue {
  currentGame: Game | null;
  startNewGame: (params: {teamNames: string[]}) => Promise<void>;
  addRound: (roundData: any) => Promise<void>;
  endGame: () => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({children}: PropsWithChildren) {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  const startNewGame = async ({teamNames}: {teamNames: string[]}) => {
    const teams: Team[] = teamNames.map(name => ({
      id: `team-${Date.now()}-${Math.random()}`,
      name,
      players: [], // Add empty players array as required by Team type
    }));

    const newGame: Game = {
      id: `game-${Date.now()}`,
      timestamp: Date.now(),
      teams,
      rounds: [],
      cardImageIndex: Math.floor(Math.random() * 4), // Randomly assign one of our 4 card images
      winningScore: 1500, // Add required winningScore property
    };

    setCurrentGame(newGame);
    await Storage.saveCurrentGame(newGame);
  };

  const addRound = async (roundData: any) => {
    if (!currentGame) return;

    const updatedGame = {
      ...currentGame,
      rounds: [...currentGame.rounds, roundData],
    };

    setCurrentGame(updatedGame);
    await Storage.saveCurrentGame(updatedGame);
  };

  const endGame = async () => {
    if (!currentGame) return;

    // Add the game to history
    await Storage.saveGameHistory([
      ...(await Storage.getGameHistory()),
      currentGame,
    ]);

    // Clear the current game
    setCurrentGame(null);
    await Storage.saveCurrentGame(null);
  };

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

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
