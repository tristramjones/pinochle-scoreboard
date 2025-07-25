// Custom error types
export class GameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameError';
  }
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface Round {
  id: string;
  timestamp: number;
  bidWinner: string;
  bid: number;
  meld: {[key: string]: number};
  trickPoints: {[key: string]: number};
  moonShotAttempted: boolean;
  moonShotSuccessful?: boolean;
}

export interface Game {
  id: string;
  timestamp: number;
  teams: Team[];
  rounds: Round[];
  cardImageIndex: number;
  winningScore: number;
  version: number; // For future migrations
}

export interface GameSettings {
  teamNames: string[];
}

export interface StorageKeys {
  CURRENT_GAME: 'pinochle_current_game';
  GAME_HISTORY: 'pinochle_game_history';
  GAME_SETTINGS: 'pinochle_game_settings';
}

// Type guard for runtime type checking
export function isValidGame(game: unknown): game is Game {
  if (!game || typeof game !== 'object') return false;

  const g = game as Game;
  return (
    typeof g.id === 'string' &&
    typeof g.timestamp === 'number' &&
    Array.isArray(g.teams) &&
    Array.isArray(g.rounds) &&
    typeof g.cardImageIndex === 'number' &&
    typeof g.winningScore === 'number' &&
    typeof g.version === 'number'
  );
}

export type RoundData = Omit<Round, 'id' | 'timestamp'>;
