import {useRouter} from 'expo-router';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import {Game, Team} from '../types/game';
import {calculateTeamScore} from '../utils/scoring';
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
  const [shouldNavigateToVictory, setShouldNavigateToVictory] = useState(false);
  const router = useRouter();

  // Handle victory navigation
  useEffect(() => {
    if (shouldNavigateToVictory) {
      router.replace('/games/victory');
      setShouldNavigateToVictory(false);
    }
  }, [shouldNavigateToVictory, router]);

  // Load current game on mount
  useEffect(() => {
    const loadCurrentGame = async () => {
      try {
        const game = await Storage.getCurrentGame();
        setCurrentGame(game);
      } catch (error) {
        console.error('Error loading current game:', error);
      }
    };

    loadCurrentGame();
  }, []);

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
      cardImageIndex: Math.floor(Math.random() * 24), // Random index for 24 cards
      winningScore: 1500,
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

    let gameIsOver = false;
    if (roundData.moonShotAttempted) {
      const bidTeamScore = calculateTeamScore(updatedGame, roundData.bidWinner);
      gameIsOver = bidTeamScore >= 1500;
    } else {
      const teamScores = updatedGame.teams.map(team => ({
        teamId: team.id,
        score: calculateTeamScore(updatedGame, team.id),
      }));
      gameIsOver = teamScores.some(({score}) => score >= 1500);
    }

    if (gameIsOver) {
      await Storage.saveGameHistory([
        ...(await Storage.getGameHistory()),
        updatedGame,
      ]);
      setCurrentGame(null);
      await Storage.saveCurrentGame(null);
      setShouldNavigateToVictory(true);
    } else {
      setCurrentGame(updatedGame);
      await Storage.saveCurrentGame(updatedGame);
      router.back();
    }
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
