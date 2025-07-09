import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useGame } from '../../contexts/GameContext';
import { Game } from '../../types/game';
import { calculateTeamScores } from '../../utils/scoring';
import * as Storage from '../../utils/storage';

export default function GamesScreen() {
  const router = useRouter();
  const { currentGame } = useGame();
  const [completedGames, setCompletedGames] = useState<Game[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGames();
  }, [currentGame]); // Reload when currentGame changes (including when it becomes null after game end)

  const loadGames = async () => {
    try {
      console.log('Loading game history...');
      const history = await Storage.getGameHistory();
      console.log('Loaded games:', history.length);
      setCompletedGames(history.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading game history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadGames();
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      {currentGame && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Game</Text>
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => router.push('/games/current')}
          >
            <View style={styles.gameHeader}>
              <Text style={styles.date}>{formatDate(currentGame.timestamp)}</Text>
              <Text style={styles.status}>In Progress</Text>
            </View>
            <View style={styles.teams}>
              {currentGame.teams.map(team => {
                const scores = calculateTeamScores(currentGame);
                return (
                  <View key={team.id} style={styles.teamScore}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.score}>{scores[team.id]} points</Text>
                  </View>
                );
              })}
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Completed Games</Text>
          <TouchableOpacity
            style={styles.newGameButton}
            onPress={() => router.push('/games/new')}
          >
            <Text style={styles.newGameText}>New Game</Text>
          </TouchableOpacity>
        </View>

        {completedGames.map(game => {
          const scores = calculateTeamScores(game);
          const winner = game.teams.reduce((prev, curr) => 
            scores[curr.id] > scores[prev.id] ? curr : prev
          );

          return (
            <View key={game.id} style={styles.gameCard}>
              <View style={styles.gameHeader}>
                <Text style={styles.date}>{formatDate(game.timestamp)}</Text>
                <Text style={styles.winner}>Winner: {winner.name}</Text>
              </View>
              <View style={styles.teams}>
                {game.teams.map(team => (
                  <View key={team.id} style={styles.teamScore}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.score}>{scores[team.id]} points</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  winner: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  teams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teamScore: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  score: {
    fontSize: 18,
    fontWeight: '500',
  },
  newGameButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newGameText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 