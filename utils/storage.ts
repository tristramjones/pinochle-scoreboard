import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, GameSettings, StorageKeys } from '../types/game';

const STORAGE_KEYS: StorageKeys = {
  CURRENT_GAME: 'pinochle_current_game',
  GAME_HISTORY: 'pinochle_game_history',
  GAME_SETTINGS: 'pinochle_game_settings',
};

export const saveCurrentGame = async (game: Game): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(game));
  } catch (error) {
    console.error('Error saving current game:', error);
    throw error;
  }
};

export const getCurrentGame = async (): Promise<Game | null> => {
  try {
    const gameString = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    return gameString ? JSON.parse(gameString) : null;
  } catch (error) {
    console.error('Error getting current game:', error);
    throw error;
  }
};

export const saveGameToHistory = async (game: Game): Promise<void> => {
  try {
    const historyString = await AsyncStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
    const history: Game[] = historyString ? JSON.parse(historyString) : [];
    history.push(game);
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving game to history:', error);
    throw error;
  }
};

export const getGameHistory = async (): Promise<Game[]> => {
  try {
    const historyString = await AsyncStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
    return historyString ? JSON.parse(historyString) : [];
  } catch (error) {
    console.error('Error getting game history:', error);
    throw error;
  }
};

export const saveGameSettings = async (settings: GameSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving game settings:', error);
    throw error;
  }
};

export const getGameSettings = async (): Promise<GameSettings | null> => {
  try {
    const settingsString = await AsyncStorage.getItem(STORAGE_KEYS.GAME_SETTINGS);
    return settingsString ? JSON.parse(settingsString) : null;
  } catch (error) {
    console.error('Error getting game settings:', error);
    throw error;
  }
};

export const clearCurrentGame = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
  } catch (error) {
    console.error('Error clearing current game:', error);
    throw error;
  }
};

export const saveGameHistory = async (games: Game[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(games));
  } catch (error) {
    console.error('Error saving game history:', error);
    throw error;
  }
}; 