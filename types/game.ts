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
  timestamp: number;
  teams: Team[];
  rounds: Round[];
  cardImageIndex: number; // Index of the card image assigned to this game
  winningScore: number;
}

export interface GameSettings {
  teamNames: string[];
}

export interface StorageKeys {
  CURRENT_GAME: 'pinochle_current_game';
  GAME_HISTORY: 'pinochle_game_history';
  GAME_SETTINGS: 'pinochle_game_settings';
}
