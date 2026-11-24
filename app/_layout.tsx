import {DefaultTheme, ThemeProvider, Slot} from 'expo-router';
import {useFonts} from 'expo-font';
import {StatusBar} from 'expo-status-bar';
import 'react-native-reanimated';
import {Theme} from '../constants/Theme';
import {GameProvider} from '../contexts/GameContext';

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

function RootLayout() {
  const [loaded] = useFonts({
    CrimsonText: require('../assets/fonts/CrimsonText-Regular.ttf'),
    'CrimsonText-Bold': require('../assets/fonts/CrimsonText-Bold.ttf'),
  });

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

export default RootLayout;
