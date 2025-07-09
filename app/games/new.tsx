import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useGame } from '../../contexts/GameContext';
import { GameSettings } from '../../types/game';

export default function NewGameScreen() {
  const router = useRouter();
  const { startNewGame, currentGame } = useGame();
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');

  const handleStartGame = async () => {
    if (!team1Name || !team2Name) {
      Alert.alert('Error', 'Please enter names for both teams');
      return;
    }

    const settings: GameSettings = {
      teamNames: [team1Name, team2Name],
    };

    try {
      await startNewGame(settings);
      router.push('/games/current');
    } catch (error) {
      Alert.alert('Error', 'Failed to start new game');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>New Game</Text>

      <View style={styles.teamSection}>
        <Text style={styles.sectionTitle}>Team 1</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Team Name</Text>
          <TextInput
            style={styles.input}
            value={team1Name}
            onChangeText={setTeam1Name}
            placeholder="Enter team name"
          />
        </View>
      </View>

      <View style={styles.teamSection}>
        <Text style={styles.sectionTitle}>Team 2</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Team Name</Text>
          <TextInput
            style={styles.input}
            value={team2Name}
            onChangeText={setTeam2Name}
            placeholder="Enter team name"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleStartGame}
      >
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
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
    borderColor: '#ccc',
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
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 