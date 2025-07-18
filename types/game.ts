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
  bidWinner: string; // team id
  bid: number;
  meld: {
    [teamId: string]: number;
  };
  trickPoints: {
    [teamId: string]: number;
  };
  moonShotAttempted?: boolean;
  moonShotSuccessful?: boolean;
  timestamp: number;
}

export interface Game {
  id: string;
  teams: Team[];
  rounds: Round[];
  winningScore: number;
  timestamp: number;
}

export interface GameSettings {
  teamNames: string[];
}

export interface StorageKeys {
  CURRENT_GAME: 'pinochle_current_game';
  GAME_HISTORY: 'pinochle_game_history';
  GAME_SETTINGS: 'pinochle_game_settings';
}
