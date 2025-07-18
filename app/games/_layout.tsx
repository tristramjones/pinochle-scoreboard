import {Stack} from 'expo-router';
import {Theme} from '../../constants/Theme';

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
        name="index"
        options={{
          headerShown: true,
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="current"
        options={{
          headerTitle: '',
        }}
      />
    </Stack>
  );
}
