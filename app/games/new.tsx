import {useRouter} from 'expo-router';
import React, {useState} from 'react';
import {ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {ThemedButton} from '../../components/ThemedButton';
import {ThemedText} from '../../components/ThemedText';
import {useGame} from '../../contexts/GameContext';
import {useTheme} from '../../hooks/useTheme';

export default function NewGameScreen() {
  const router = useRouter();
  const {startNewGame} = useGame();
  const theme = useTheme();
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');

  const handleStartGame = async () => {
    try {
      await startNewGame({
        teamNames: [team1Name || 'Team 1', team2Name || 'Team 2'],
      });
      router.replace('/games/current');
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
    >
      <ThemedText type="title" style={styles.title}>
        New Game
      </ThemedText>

      <View style={styles.teamSection}>
        <ThemedText type="heading" style={styles.sectionTitle}>
          Team 1
        </ThemedText>
        <View style={styles.inputGroup}>
          <ThemedText type="label" style={styles.label}>
            Team Name
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.input.background,
                borderColor: theme.colors.input.border,
                color: theme.colors.input.text,
              },
            ]}
            value={team1Name}
            onChangeText={setTeam1Name}
            placeholder="Enter team name"
            placeholderTextColor={theme.colors.input.placeholder}
          />
        </View>
      </View>

      <View style={styles.teamSection}>
        <ThemedText type="heading" style={styles.sectionTitle}>
          Team 2
        </ThemedText>
        <View style={styles.inputGroup}>
          <ThemedText type="label" style={styles.label}>
            Team Name
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.input.background,
                borderColor: theme.colors.input.border,
                color: theme.colors.input.text,
              },
            ]}
            value={team2Name}
            onChangeText={setTeam2Name}
            placeholder="Enter team name"
            placeholderTextColor={theme.colors.input.placeholder}
          />
        </View>
      </View>

      <ThemedButton title="Start Game" onPress={handleStartGame} size="lg" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  teamSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
});
