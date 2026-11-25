import {DefaultTheme, ThemeProvider, Slot} from 'expo-router';
import {useFonts} from 'expo-font';
import {StatusBar} from 'expo-status-bar';
import 'react-native-reanimated';
import {Theme} from '../constants/Theme';
import {GameProvider} from '../contexts/GameContext';

// Customize the default theme to match our app's theme
const appTheme = {
  ...DefaultTheme,
  dark: true,
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
    IMFellEnglish: require('../assets/fonts/IMFellEnglish-Regular.ttf'),
    'IMFellEnglish-Italic': require('../assets/fonts/IMFellEnglish-Italic.ttf'),
    CormorantSC: require('../assets/fonts/CormorantSC-SemiBold.ttf'),
    Cinzel: require('../assets/fonts/Cinzel.ttf'),
    PlayfairDisplay: require('../assets/fonts/PlayfairDisplay-Regular.ttf'),
    'PlayfairDisplay-Bold': require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
    CrimsonText: require('../assets/fonts/CrimsonText-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={appTheme}>
      <GameProvider>
        <Slot />
        <StatusBar style="light" />
      </GameProvider>
    </ThemeProvider>
  );
}

export default RootLayout;
