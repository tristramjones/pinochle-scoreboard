import {useTheme, useRouter, Stack} from 'expo-router';
import {Keyboard} from 'react-native';
import {ThemedButton} from '../../components/ThemedButton';
import {Theme} from '../../constants/Theme';

export default function GamesLayout() {
  const router = useRouter();
  const {colors} = useTheme();

  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerStyle: {
          backgroundColor: Theme.colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: {fontFamily: Theme.typography.fonts.display},
        headerRight: () => (
          <ThemedButton
            title="Scoring guide ♧"
            variant="text"
            size="sm"
            accessibilityLabel="Scoring help"
            onPress={() => {
              Keyboard.dismiss();
              router.push('/games/help');
            }}
          />
        ),
      }}
    >
      <Stack.Screen
        name="help"
        options={{
          presentation: 'modal',
          headerTitle: '',
          headerBackVisible: false,
          headerRight: () => (
            <ThemedButton
              title="Done"
              variant="text"
              size="sm"
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace('/games')
              }
            />
          ),
        }}
      />
      <Stack.Screen
        name="index"
        options={{
          headerTitle: '',
          headerShown: true,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="current"
        options={{
          headerTitle: '',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="round/new"
        options={{
          headerTitle: '',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="victory"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: '',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
