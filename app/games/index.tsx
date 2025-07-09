import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedButton } from '../../components/ThemedButton';
import { useGame } from '../../contexts/GameContext';
import { useTheme } from '../../hooks/useTheme';
import { Game } from '../../types/game';
import { calculateTeamScores } from '../../utils/scoring';
import * as Storage from '../../utils/storage';

export default function GamesScreen() {
  const router = useRouter();
  const { currentGame } = useGame();
  const { theme, colors } = useTheme();
  const [completedGames, setCompletedGames] = useState<Game[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);

  const loadCompletedGames = useCallback(async () => {
    try {
      const history = await Storage.getGameHistory();
      setCompletedGames(history);
    } catch (error) {
      console.error('Error loading game history:', error);
      Alert.alert('Error', 'Failed to load game history');
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadCompletedGames();
    } finally {
      setRefreshing(false);
    }
  }, [loadCompletedGames]);

  React.useEffect(() => {
    loadCompletedGames();
  }, [loadCompletedGames]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const toggleGameSelection = (gameId: string) => {
    setSelectedGames(prev => {
      if (prev.includes(gameId)) {
        return prev.filter(id => id !== gameId);
      } else {
        return [...prev, gameId];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedGames.length === completedGames.length) {
      setSelectedGames([]);
    } else {
      setSelectedGames(completedGames.map(game => game.id));
    }
  };

  const handleDeleteSelected = async () => {
    try {
      setIsDeleting(true);
      await Storage.deleteGamesFromHistory(selectedGames);
      await loadCompletedGames();
      setSelectedGames([]);
      setIsDeleting(false);
    } catch (error) {
      console.error('Error deleting games:', error);
      Alert.alert('Error', 'Failed to delete selected games');
    }
  };

  const renderGameCard = (game: Game, isCompleted = false) => {
    const scores = calculateTeamScores(game);
    const winner = game.teams.reduce((prev, curr) => 
      scores[curr.id] > scores[prev.id] ? curr : prev
    );

    return (
      <TouchableOpacity
        key={game.id}
        style={[
          styles.gameCard,
          {
            backgroundColor: colors.card.background,
            shadowColor: colors.card.shadow,
          }
        ]}
        onPress={() => router.push(isCompleted ? `/games/${game.id}` : '/games/current')}
      >
        <View style={styles.gameHeader}>
          <View style={styles.gameHeaderLeft}>
            {isCompleted && isDeleting && (
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleGameSelection(game.id)}
              >
                <View style={[
                  styles.checkboxInner,
                  {
                    borderColor: colors.primary,
                    backgroundColor: selectedGames.includes(game.id) 
                      ? colors.primary 
                      : 'transparent'
                  }
                ]} />
              </TouchableOpacity>
            )}
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {formatDate(game.timestamp)}
            </Text>
          </View>
          <Text style={[
            isCompleted ? styles.winner : styles.status,
            { color: colors.primary }
          ]}>
            {isCompleted ? `${winner.name} Won!` : 'In Progress'}
          </Text>
        </View>
        <View style={styles.teams}>
          {game.teams.map(team => (
            <View key={team.id} style={styles.teamScore}>
              <Text style={[
                styles.teamName,
                { color: colors.text }
              ]}>
                {team.name}
              </Text>
              <Text style={[
                styles.score,
                { color: colors.text }
              ]}>
                {scores[team.id]} points
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Game</Text>
        {currentGame ? (
          renderGameCard(currentGame)
        ) : (
          <View style={[
            styles.emptyStateCard,
            { backgroundColor: colors.surface }
          ]}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No game in progress
            </Text>
          </View>
        )}
        <ThemedButton
          title="New Game"
          onPress={() => router.push('/games/new')}
          style={{ marginTop: theme.spacing.sm }}
        />
      </View>

      {completedGames.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Completed Games
            </Text>
            <View style={styles.completedGamesActions}>
              {isDeleting ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.primary }
                    ]}
                    onPress={toggleSelectAll}
                  >
                    <Text style={styles.actionButtonText}>
                      {selectedGames.length === completedGames.length ? 'Deselect All' : 'Select All'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.textSecondary }
                    ]}
                    onPress={() => {
                      setIsDeleting(false);
                      setSelectedGames([]);
                    }}
                  >
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.error }
                    ]}
                    onPress={handleDeleteSelected}
                    disabled={selectedGames.length === 0}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <ThemedButton
                  title="Delete Games"
                  onPress={() => setIsDeleting(true)}
                  variant="secondary"
                  size="sm"
                />
              )}
            </View>
          </View>
          {completedGames.map(game => renderGameCard(game, true))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateCard: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  winner: {
    fontSize: 14,
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
  checkboxInner: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}); 