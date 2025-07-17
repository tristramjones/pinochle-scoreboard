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
  const [winningScore, setWinningScore] = useState('');

  const handleStartGame = async () => {
    if (!team1Name || !team2Name || !winningScore) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const score = parseInt(winningScore);
    if (isNaN(score) || score <= 0) {
      Alert.alert('Error', 'Please enter a valid winning score');
      return;
    }

    try {
      await startNewGame({
        teamNames: [team1Name, team2Name],
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to start new game');
    }
  };

  return (
    <ScrollView style={[styles.container, styles.containerThemed]}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <ThemedText type="label">Team 1 Name</ThemedText>
          <TextInput
            style={[styles.input, styles.inputThemed]}
            value={team1Name}
            onChangeText={setTeam1Name}
            placeholder="Enter team 1 name"
            placeholderTextColor={Theme.colors.input.placeholder}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="label">Team 2 Name</ThemedText>
          <TextInput
            style={[styles.input, styles.inputThemed]}
            value={team2Name}
            onChangeText={setTeam2Name}
            placeholder="Enter team 2 name"
            placeholderTextColor={Theme.colors.input.placeholder}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="label">Winning Score</ThemedText>
          <TextInput
            style={[styles.input, styles.inputThemed]}
            value={winningScore}
            onChangeText={setWinningScore}
            placeholder="Enter winning score"
            placeholderTextColor={Theme.colors.input.placeholder}
            keyboardType="number-pad"
          />
        </View>

        <ThemedButton
          title="Start Game"
          onPress={handleStartGame}
          variant="primary"
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
    gap: Theme.spacing.md,
  } as ViewStyle,
  inputGroup: {
    gap: Theme.spacing.xs,
  } as ViewStyle,
  input: {
    height: Theme.spacing.xl,
    borderWidth: 1,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.sm,
    fontSize: Theme.typography.fontSizes.sm,
  } as TextStyle,
  inputThemed: {
    backgroundColor: Theme.colors.input.background,
    borderColor: Theme.colors.input.border,
    color: Theme.colors.input.text,
  } as TextStyle,
});
