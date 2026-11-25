import {useTheme, useRouter, Stack} from 'expo-router';
import {Keyboard, Pressable} from 'react-native';
import {ThemedText} from '../../components/ThemedText';
import {Theme} from '../../constants/Theme';

export default function GamesLayout() {
  const router = useRouter();
  const {colors} = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: {fontFamily: Theme.typography.fonts.display},
        headerRight: () => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scoring help"
            hitSlop={8}
            style={{
              minHeight: 44,
              justifyContent: 'center',
              paddingHorizontal: 8,
            }}
            onPress={() => {
              Keyboard.dismiss();
              router.push('/games/help');
            }}
          >
            <ThemedText style={{color: Theme.colors.accent.gold, fontSize: 17}}>
              Scoring guide ♧
            </ThemedText>
          </Pressable>
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
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              style={{
                minHeight: 44,
                justifyContent: 'center',
                paddingHorizontal: 8,
              }}
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace('/games')
              }
            >
              <ThemedText
                style={{color: Theme.colors.accent.gold, fontSize: 17}}
              >
                Done
              </ThemedText>
            </Pressable>
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
