import { Stack } from 'expo-router';
import { Text } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function GamesLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Games',
        }}
      />
      <Stack.Screen
        name="current"
        options={{
          title: 'Current Game',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: 'New Game',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Game Details',
          headerTitle: () => <Text>Game Details</Text>
        }}
      />
    </Stack>
  );
} 