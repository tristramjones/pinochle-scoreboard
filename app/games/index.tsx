import {useRouter} from 'expo-router';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {ThemedButton} from '../../components/ThemedButton';
import {ThemedText} from '../../components/ThemedText';
import {useGame} from '../../contexts/GameContext';
import {useTheme} from '../../hooks/useTheme';
import {Game} from '../../types/game';
import {calculateTeamScores} from '../../utils/scoring';
import * as Storage from '../../utils/storage';

export default function GamesScreen() {
  const router = useRouter();
  const {currentGame} = useGame();
  const theme = useTheme();
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
      scores[curr.id] > scores[prev.id] ? curr : prev,
    );

    return (
      <TouchableOpacity
        key={game.id}
        style={[
          styles.gameCard,
          {
            backgroundColor: theme.colors.card.background,
            shadowColor: theme.colors.card.shadow,
          },
        ]}
        onPress={() =>
          router.push(isCompleted ? `/games/${game.id}` : '/games/current')
        }
      >
        <View style={styles.gameHeader}>
          <View style={styles.gameHeaderLeft}>
            {isCompleted && isDeleting && (
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleGameSelection(game.id)}
              >
                <View
                  style={[
                    styles.checkboxInner,
                    {
                      borderColor: theme.colors.primary,
                      backgroundColor: selectedGames.includes(game.id)
                        ? theme.colors.primary
                        : 'transparent',
                    },
                  ]}
                />
              </TouchableOpacity>
            )}
            <ThemedText
              type="label"
              style={[styles.date, {color: theme.colors.textSecondary}]}
            >
              {formatDate(game.timestamp)}
            </ThemedText>
          </View>
          <ThemedText
            type="label"
            style={[
              isCompleted ? styles.winner : styles.status,
              {color: theme.colors.primary},
            ]}
          >
            {isCompleted ? `${winner.name} Won!` : 'In Progress'}
          </ThemedText>
        </View>
        <View style={styles.teams}>
          {game.teams.map(team => (
            <View key={team.id} style={styles.teamScore}>
              <ThemedText
                type="subtitle"
                style={[styles.teamName, {color: theme.colors.text}]}
              >
                {team.name}
              </ThemedText>
              <ThemedText
                type="score"
                style={[styles.score, {color: theme.colors.text}]}
              >
                {scores[team.id]} points
              </ThemedText>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.section}>
        <ThemedText type="heading" style={styles.sectionTitle}>
          Current Game
        </ThemedText>
        {currentGame ? (
          renderGameCard(currentGame)
        ) : (
          <View
            style={[
              styles.emptyStateCard,
              {backgroundColor: theme.colors.surface},
            ]}
          >
            <ThemedText
              type="label"
              style={[
                styles.emptyStateText,
                {color: theme.colors.textSecondary},
              ]}
            >
              No game in progress
            </ThemedText>
          </View>
        )}
        <ThemedButton
          title="New Game"
          onPress={() => router.push('/games/new')}
          style={{marginTop: theme.spacing.sm}}
        />
      </View>

      {completedGames.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading" style={styles.sectionTitle}>
              Completed Games
            </ThemedText>
            <View style={styles.completedGamesActions}>
              {isDeleting ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {backgroundColor: theme.colors.primary},
                    ]}
                    onPress={toggleSelectAll}
                  >
                    <ThemedText
                      style={[
                        styles.actionButtonText,
                        {color: theme.colors.button.text},
                      ]}
                    >
                      {selectedGames.length === completedGames.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {backgroundColor: theme.colors.textSecondary},
                    ]}
                    onPress={() => {
                      setIsDeleting(false);
                      setSelectedGames([]);
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.actionButtonText,
                        {color: theme.colors.button.text},
                      ]}
                    >
                      Cancel
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {backgroundColor: theme.colors.error},
                    ]}
                    onPress={handleDeleteSelected}
                    disabled={selectedGames.length === 0}
                  >
                    <ThemedText
                      style={[
                        styles.actionButtonText,
                        {color: theme.colors.button.text},
                      ]}
                    >
                      Delete
                    </ThemedText>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  gameCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    marginBottom: 4,
  },
  teams: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  teamScore: {
    alignItems: 'center',
  },
  teamName: {
    marginBottom: 4,
  },
  score: {
    marginBottom: 4,
  },
  winner: {
    fontWeight: '600',
  },
  status: {
    fontWeight: '500',
  },
  emptyStateCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    textAlign: 'center',
  },
  completedGamesActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1,
  },
});
