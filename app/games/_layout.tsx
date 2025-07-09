import { Stack } from 'expo-router';
import { Text } from 'react-native';
import { Theme } from '../../constants/Theme';

export default function GamesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Theme.colors.background,
        },
        headerTintColor: Theme.colors.text,
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: () => <Text>Game Details</Text>
        }}
      />
    </Stack>
  );
} 