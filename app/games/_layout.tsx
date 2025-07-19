import {useTheme} from '@react-navigation/native';
import {Stack} from 'expo-router';

export default function GamesLayout() {
  const {colors} = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
      }}
    >
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
    </Stack>
  );
}
