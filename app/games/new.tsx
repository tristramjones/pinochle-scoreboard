import {KeyboardScrollView} from '../../components/KeyboardScrollView';
import {useRouter} from 'expo-router';
import React, {useState} from 'react';
import {
  Alert,
  Keyboard,
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
  const {startNewGame, isLoading} = useGame();
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');

  const handleStartGame = async () => {
    Keyboard.dismiss();
    const trimmedTeam1Name = team1Name.trim();
    const trimmedTeam2Name = team2Name.trim();

    if (!trimmedTeam1Name || !trimmedTeam2Name) {
      Alert.alert('Error', 'Please enter names for both teams');
      return;
    }

    try {
      await startNewGame({
        teamNames: [trimmedTeam1Name, trimmedTeam2Name],
      });
      router.replace('/games/current');
    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Error', 'Failed to start game');
    }
  };

  return (
    <KeyboardScrollView
      style={[styles.container, styles.containerThemed]}
      contentContainerStyle={styles.contentContainer}
    >
      <ThemedText type="title" style={styles.phaseTitle}>
        New Game
      </ThemedText>

      <View style={styles.inputSection}>
        <View style={styles.teamInput}>
          <ThemedText type="heading" style={styles.inputLabel}>
            Team 1
          </ThemedText>
          <TextInput
            returnKeyType="done"
            keyboardAppearance="dark"
            onSubmitEditing={Keyboard.dismiss}
            style={[styles.input, styles.inputThemed]}
            value={team1Name}
            onChangeText={setTeam1Name}
            placeholder="Enter team name"
            placeholderTextColor={Theme.colors.input.placeholder}
          />
        </View>

        <View style={styles.teamInput}>
          <ThemedText type="heading" style={styles.inputLabel}>
            Team 2
          </ThemedText>
          <TextInput
            returnKeyType="done"
            keyboardAppearance="dark"
            onSubmitEditing={Keyboard.dismiss}
            style={[styles.input, styles.inputThemed]}
            value={team2Name}
            onChangeText={setTeam2Name}
            placeholder="Enter team name"
            placeholderTextColor={Theme.colors.input.placeholder}
          />
        </View>
      </View>

      <ThemedButton
        title="Start Game"
        disabled={isLoading}
        onPress={handleStartGame}
        variant="primary"
        size="lg"
        style={styles.submitButton}
      />
    </KeyboardScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  containerThemed: {
    backgroundColor: Theme.colors.background,
  } as ViewStyle,
  contentContainer: {
    padding: Theme.spacing.lg,
  } as ViewStyle,
  phaseTitle: {
    letterSpacing: 0.5,
    fontSize: Theme.typography.fontSizes.xxl,
    fontFamily: Theme.typography.fonts.bold,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    color: Theme.colors.primary,
  } as TextStyle,
  inputSection: {
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  teamInput: {
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,
  inputLabel: {
    marginBottom: Theme.spacing.md,
    fontSize: Theme.typography.fontSizes.xl,
    fontFamily: Theme.typography.fonts.regular,
    color: Theme.colors.primary,
  } as TextStyle,
  input: {
    borderBottomWidth: 3,
    height: Theme.button.sizes.lg.height,
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
  submitButton: {
    marginTop: Theme.spacing.xl,
  } as ViewStyle,
});
