import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Load games initially and when currentGame changes
  useEffect(() => {
    loadGames();
  }, [currentGame]);

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

  const handleDeleteGame = async (gameId: string) => {
    Alert.alert(
      "Delete Game",
      "Are you sure you want to delete this game?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedHistory = completedGames.filter(game => game.id !== gameId);
              await Storage.saveGameHistory(updatedHistory);
              setCompletedGames(updatedHistory);
            } catch (error) {
              console.error('Error deleting game:', error);
              Alert.alert('Error', 'Failed to delete game');
            }
          }
        }
      ]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedGames.size === 0) return;

    Alert.alert(
      "Delete Selected Games",
      `Are you sure you want to delete ${selectedGames.size} selected game${selectedGames.size > 1 ? 's' : ''}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedHistory = completedGames.filter(game => !selectedGames.has(game.id));
              await Storage.saveGameHistory(updatedHistory);
              setCompletedGames(updatedHistory);
              setSelectedGames(new Set());
              setIsSelectionMode(false);
            } catch (error) {
              console.error('Error deleting games:', error);
              Alert.alert('Error', 'Failed to delete selected games');
            }
          }
        }
      ]
    );
  };

  const toggleGameSelection = (gameId: string) => {
    const newSelected = new Set(selectedGames);
    if (newSelected.has(gameId)) {
      newSelected.delete(gameId);
      if (newSelected.size === 0) {
        setIsSelectionMode(false);
      }
    } else {
      newSelected.add(gameId);
    }
    setSelectedGames(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedGames.size === completedGames.length) {
      // If all are selected, deselect all
      setSelectedGames(new Set());
      setIsSelectionMode(false);
    } else {
      // Select all games
      setSelectedGames(new Set(completedGames.map(game => game.id)));
    }
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Game</Text>
        {currentGame ? (
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
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>No game in progress</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.newGameButton}
          onPress={() => router.push('/games/new')}
        >
          <Text style={styles.newGameText}>New Game</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Completed Games</Text>
          {completedGames.length > 0 && (
            <View style={styles.completedGamesActions}>
              {isSelectionMode ? (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.selectAllButton]}
                    onPress={toggleSelectAll}
                  >
                    <Text style={styles.actionButtonText}>
                      {selectedGames.size === completedGames.length ? 'Deselect All' : 'Select All'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => {
                      setIsSelectionMode(false);
                      setSelectedGames(new Set());
                    }}
                  >
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDeleteSelected}
                  >
                    <Text style={styles.actionButtonText}>Delete Selected</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setIsSelectionMode(true)}
                >
                  <Text style={styles.actionButtonText}>Select</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        {completedGames.length > 0 ? (
          completedGames.map(game => {
            const scores = calculateTeamScores(game);
            const winner = game.teams.reduce((prev, curr) => 
              scores[curr.id] > scores[prev.id] ? curr : prev
            );

            return (
              <View key={game.id} style={styles.gameCard}>
                <View style={styles.gameHeader}>
                  <View style={styles.gameHeaderLeft}>
                    {isSelectionMode && (
                      <TouchableOpacity
                        style={styles.checkbox}
                        onPress={() => toggleGameSelection(game.id)}
                      >
                        <Ionicons
                          name={selectedGames.has(game.id) ? "checkbox" : "square-outline"}
                          size={24}
                          color="#007AFF"
                        />
                      </TouchableOpacity>
                    )}
                    <Text style={styles.date}>{formatDate(game.timestamp)}</Text>
                  </View>
                  <View style={styles.gameHeaderRight}>
                    <Text style={styles.winner}>Winner: {winner.name}</Text>
                    {!isSelectionMode && (
                      <TouchableOpacity
                        onPress={() => handleDeleteGame(game.id)}
                        style={styles.deleteIcon}
                      >
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>
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
          })
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>No completed games yet</Text>
            <Text style={styles.emptyStateSubtext}>Start a new game to begin tracking your scores!</Text>
          </View>
        )}
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
  emptyStateCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  newGameText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  completedGamesActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  gameHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gameHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    padding: 4,
  },
  deleteIcon: {
    padding: 4,
  },
  selectAllButton: {
    backgroundColor: '#007AFF',
  },
}); 