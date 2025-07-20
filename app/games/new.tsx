import {useRouter} from 'expo-router';
import React, {useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {ThemedButton} from '../../components/ThemedButton';
import {ThemedText} from '../../components/ThemedText';
import {Theme} from '../../constants/Theme';
import {useGame} from '../../contexts/GameContext';

export default function NewGameScreen() {
  const router = useRouter();
  const {startNewGame} = useGame();
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');

  const handleStartGame = async () => {
    if (!team1Name || !team2Name) {
      Alert.alert('Error', 'Please enter names for both teams');
      return;
    }

    try {
      await startNewGame({
        teamNames: [team1Name, team2Name],
      });
      router.replace('/games/current');
    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Error', 'Failed to start game');
    }
  };

  return (
    <ScrollView style={[styles.container, styles.containerThemed]}>
      <View style={styles.form}>
        <ThemedText type="heading" style={styles.title}>
          New Game
        </ThemedText>

        <View style={styles.inputGroup}>
          <ThemedText type="label">Team 1</ThemedText>
          <TextInput
            style={[styles.input, styles.inputThemed]}
            value={team1Name}
            onChangeText={setTeam1Name}
            placeholder="Enter team 1 name"
            placeholderTextColor={Theme.colors.input.placeholder}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="label">Team 2</ThemedText>
          <TextInput
            style={[styles.input, styles.inputThemed]}
            value={team2Name}
            onChangeText={setTeam2Name}
            placeholder="Enter team 2 name"
            placeholderTextColor={Theme.colors.input.placeholder}
          />
        </View>

        <ThemedButton
          title="Start Game"
          onPress={handleStartGame}
          variant="primary"
          size="md"
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.md,
  } as ViewStyle,
  containerThemed: {
    backgroundColor: Theme.colors.background,
  } as ViewStyle,
  form: {
    gap: Theme.spacing.lg,
  } as ViewStyle,
  title: {
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  } as TextStyle,
  inputGroup: {
    gap: Theme.spacing.xs,
  } as ViewStyle,
  input: {
    height: Theme.button.height,
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    fontSize: Theme.typography.fontSizes.xl,
    fontFamily: Theme.typography.fonts.regular,
  } as TextStyle,
  inputThemed: {
    backgroundColor: Theme.colors.input.background,
    borderColor: Theme.colors.input.border,
    color: Theme.colors.input.text,
  } as TextStyle,
  button: {
    marginTop: Theme.spacing.md,
  } as ViewStyle,
});
