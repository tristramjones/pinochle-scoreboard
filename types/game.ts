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
  roundPoints?: {[teamId: string]: number};
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
  endedEarly?: boolean;
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

export interface GameLibrary {
  activeGames: Game[];
  history: Game[];
  selectedId: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isPointsMap = (value: unknown): boolean =>
  isRecord(value) && Object.values(value).every(isFiniteNumber);

// Reject malformed nested data before rendering or calculating saved scores.
export function isValidGame(value: unknown): value is Game {
  if (!isRecord(value)) return false;
  const {teams, rounds} = value;
  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    isFiniteNumber(value.timestamp) &&
    Array.isArray(teams) &&
    teams.length === 2 &&
    teams.every(
      team =>
        isRecord(team) &&
        typeof team.id === 'string' &&
        typeof team.name === 'string' &&
        Array.isArray(team.players),
    ) &&
    new Set(teams.map(team => team.id)).size === 2 &&
    Array.isArray(rounds) &&
    rounds.every(
      round =>
        isRecord(round) &&
        typeof round.id === 'string' &&
        isFiniteNumber(round.timestamp) &&
        teams.some(team => team.id === round.bidWinner) &&
        isFiniteNumber(round.bid) &&
        round.bid > 0 &&
        isPointsMap(round.meld) &&
        isPointsMap(round.trickPoints) &&
        typeof round.moonShotAttempted === 'boolean' &&
        (round.moonShotSuccessful === undefined ||
          typeof round.moonShotSuccessful === 'boolean') &&
        (round.roundPoints === undefined || isPointsMap(round.roundPoints)),
    ) &&
    isFiniteNumber(value.cardImageIndex) &&
    Number.isInteger(value.cardImageIndex) &&
    value.cardImageIndex >= 0 &&
    value.cardImageIndex < 24 &&
    isFiniteNumber(value.winningScore) &&
    value.winningScore > 0 &&
    isFiniteNumber(value.version) &&
    Number.isInteger(value.version) &&
    value.version >= 1 &&
    (value.endedEarly === undefined || typeof value.endedEarly === 'boolean')
  );
}

export function isValidLibrary(value: unknown): value is GameLibrary {
  if (
    !isRecord(value) ||
    !Array.isArray(value.activeGames) ||
    !Array.isArray(value.history)
  )
    return false;
  const games = [...value.activeGames, ...value.history];
  return (
    games.every(isValidGame) &&
    new Set(games.map(game => game.id)).size === games.length &&
    (value.selectedId === null ||
      (typeof value.selectedId === 'string' &&
        value.activeGames.some(game => game.id === value.selectedId)))
  );
}

export type RoundData = Omit<Round, 'id' | 'timestamp'>;
