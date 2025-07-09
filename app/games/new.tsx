import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { ThemedButton } from '../../components/ThemedButton';
import { useGame } from '../../contexts/GameContext';
import { useTheme } from '../../hooks/useTheme';

export default function NewGameScreen() {
  const router = useRouter();
  const { startNewGame } = useGame();
  const { theme, colors } = useTheme();
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');

  const handleStartGame = async () => {
    try {
      await startNewGame({
        teamNames: [team1Name || 'Team 1', team2Name || 'Team 2']
      });
      router.replace('/games/current');
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>New Game</Text>

      <View style={styles.teamSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Team 1</Text>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Team Name</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input.background,
                borderColor: colors.input.border,
                color: colors.input.text,
              }
            ]}
            value={team1Name}
            onChangeText={setTeam1Name}
            placeholder="Enter team name"
            placeholderTextColor={colors.input.placeholder}
          />
        </View>
      </View>

      <View style={styles.teamSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Team 2</Text>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Team Name</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input.background,
                borderColor: colors.input.border,
                color: colors.input.text,
              }
            ]}
            value={team2Name}
            onChangeText={setTeam2Name}
            placeholder="Enter team name"
            placeholderTextColor={colors.input.placeholder}
          />
        </View>
      </View>

      <ThemedButton
        title="Start Game"
        onPress={handleStartGame}
        size="lg"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
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
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
}); 