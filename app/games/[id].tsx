import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Game } from '../../types/game';
import { calculateTeamScores } from '../../utils/scoring';
import * as Storage from '../../utils/storage';

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const [game, setGame] = useState<Game | null>(null);

  const loadGame = useCallback(async () => {
    try {
      const history = await Storage.getGameHistory();
      const foundGame = history.find(g => g.id === id);
      setGame(foundGame || null);
      
      if (foundGame) {
        const title = `${foundGame.teams[0].name} vs ${foundGame.teams[1].name}`;
        navigation.setOptions({
          title,
          headerTitle: title
        });
      }
    } catch (error) {
      console.error('Error loading game:', error);
    }
  }, [id, navigation]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (!game) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Game not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Back to Games</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const scores = calculateTeamScores(game);
  const winner = game.teams.reduce((prev, curr) => 
    scores[curr.id] > scores[prev.id] ? curr : prev
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(game.timestamp)}</Text>
        <View style={styles.teams}>
          {game.teams.map(team => (
            <View key={team.id} style={styles.teamScore}>
              <Text style={[
                styles.teamName,
                team.id === winner.id && styles.winnerText
              ]}>
                {team.name}
                {team.id === winner.id && ' 🏆'}
              </Text>
              <Text style={[
                styles.score,
                team.id === winner.id && styles.winnerText
              ]}>
                {scores[team.id]} points
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.rounds}>
        <Text style={styles.sectionTitle}>Rounds</Text>
        {game.rounds.map((round, index) => {
          const bidWinningTeam = game.teams.find(team => team.id === round.bidWinner);
          const roundNumber = index + 1;

          return (
            <View key={round.id} style={styles.roundCard}>
              <Text style={styles.roundTitle}>Round {roundNumber}</Text>
              
              <View style={styles.bidInfo}>
                <Text style={styles.bidText}>
                  {bidWinningTeam?.name} bid {round.bid}
                </Text>
                {round.meld[round.bidWinner] + round.trickPoints[round.bidWinner] >= round.bid ? (
                  <Text style={styles.madeBid}>Made bid</Text>
                ) : (
                  <Text style={styles.setBid}>Went set</Text>
                )}
              </View>

              <View style={styles.pointsTable}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableCell}>Team</Text>
                  <Text style={styles.tableCell}>Meld</Text>
                  <Text style={styles.tableCell}>Tricks</Text>
                  <Text style={styles.tableCell}>Total</Text>
                  <Text style={styles.tableCell}>Game Score</Text>
                </View>
                {game.teams.map(team => {
                  const meldPoints = round.meld[team.id] || 0;
                  const trickPoints = round.trickPoints[team.id] || 0;
                  const roundTotal = meldPoints + trickPoints;
                  
                  // Calculate cumulative score up to this round
                  const gameScore = game.rounds
                    .slice(0, index + 1) // Only include rounds up to current
                    .reduce((sum, r) => {
                      const meld = r.meld[team.id] || 0;
                      const tricks = r.trickPoints[team.id] || 0;
                      const roundTotal = meld + tricks;

                      // If this team bid and went set, subtract the bid amount
                      if (r.bidWinner === team.id && roundTotal < r.bid) {
                        return sum - r.bid;
                      }
                      
                      return sum + roundTotal;
                    }, 0);
                  
                  return (
                    <View key={team.id} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{team.name}</Text>
                      <Text style={styles.tableCell}>{meldPoints}</Text>
                      <Text style={styles.tableCell}>{trickPoints}</Text>
                      <Text style={styles.tableCell}>{roundTotal}</Text>
                      <Text style={[
                        styles.tableCell,
                        styles.gameScoreCell
                      ]}>{gameScore}</Text>
                    </View>
                  );
                })}
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
    marginBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  teams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
  },
  teamScore: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  score: {
    fontSize: 20,
    fontWeight: '500',
  },
  winnerText: {
    color: '#007AFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  rounds: {
    flex: 1,
  },
  roundCard: {
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
  roundTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bidInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bidText: {
    fontSize: 16,
    color: '#666',
  },
  madeBid: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  setBid: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
  pointsTable: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  gameScoreCell: {
    fontWeight: '600',
    color: '#007AFF'
  }
}); 