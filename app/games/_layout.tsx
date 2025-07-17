import {Stack} from 'expo-router';
import {ThemedText} from '../../components/ThemedText';
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
        name="[id]"
        options={{
          headerTitle: () => <ThemedText>Game Details</ThemedText>,
        }}
      />
    </Stack>
  );
}
