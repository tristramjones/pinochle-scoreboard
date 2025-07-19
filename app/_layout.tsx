import {DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {Slot} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {useEffect} from 'react';
import 'react-native-reanimated';
import {Theme} from '../constants/Theme';
import {GameProvider} from '../contexts/GameContext';
import * as Storage from '../utils/storage';

// Customize the default theme to match our app's theme
const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Theme.colors.primary,
    background: Theme.colors.background,
    card: Theme.colors.background,
    text: Theme.colors.text,
  },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    CrimsonText: require('../assets/fonts/CrimsonText-Regular.ttf'),
    'CrimsonText-Bold': require('../assets/fonts/CrimsonText-Bold.ttf'),
  });

  useEffect(() => {
    // Run the migration when the app starts
    Storage.migrateAllGames().catch(error => {
      console.error('Failed to migrate games:', error);
    });
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={appTheme}>
      <GameProvider>
        <Slot />
        <StatusBar style="dark" />
      </GameProvider>
    </ThemeProvider>
  );
}
