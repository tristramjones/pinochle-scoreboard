import {useFocusEffect} from '@react-navigation/native';
import {useRouter} from 'expo-router';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {ThemedButton} from '../../components/ThemedButton';
import {ThemedText} from '../../components/ThemedText';
import {Theme} from '../../constants/Theme';
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

  // Load completed games on focus
  useFocusEffect(
    useCallback(() => {
      loadCompletedGames();
    }, [loadCompletedGames]),
  );

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
          selectedGames.includes(game.id) && styles.selectedGameCard,
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
            <ThemedText type="label" style={[styles.date, styles.dateText]}>
              {formatDate(game.timestamp)}
            </ThemedText>
          </View>
          <ThemedText
            type="label"
            style={[
              isCompleted ? styles.winner : styles.status,
              styles.winnerText,
            ]}
          >
            {isCompleted ? `${winner.name} Won!` : 'In Progress'}
          </ThemedText>
        </View>
        <View style={styles.teams}>
          {game.teams.map(team => (
            <View key={team.id} style={styles.teamScore}>
              <ThemedText type="subtitle" style={styles.teamName}>
                {team.name}
              </ThemedText>
              <ThemedText type="score" style={styles.score}>
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
      style={[styles.container, styles.containerThemed]}
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
          <ThemedText type="subtitle" style={styles.emptyStateText}>
            No game in progress
          </ThemedText>
        )}
        <ThemedButton
          title="New Game"
          onPress={() => router.push('/games/new')}
          variant="primary"
          size="md"
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
    padding: Theme.spacing.md,
  } as ViewStyle,
  containerThemed: {
    backgroundColor: Theme.colors.background,
  } as ViewStyle,
  section: {
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  } as ViewStyle,
  sectionTitle: {
    marginBottom: Theme.spacing.sm,
  } as TextStyle,
  gameCard: {
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.card.background,
    marginBottom: Theme.spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: Theme.colors.card.shadow,
        shadowOffset: {width: 2, height: 3}, // More shadow on right and bottom
        shadowOpacity: 0.6,
        shadowRadius: 6, // Slightly smaller radius for more directional shadow
      },
      android: {
        elevation: 8,
      },
    }),
  } as ViewStyle,
  selectedGameCard: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  } as ViewStyle,
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  } as ViewStyle,
  gameHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  } as ViewStyle,
  date: {
    marginBottom: Theme.spacing.xs,
  } as TextStyle,
  dateText: {
    color: Theme.colors.textSecondary,
  } as TextStyle,
  teams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.sm,
  } as ViewStyle,
  teamScore: {
    flex: 1,
    alignItems: 'center',
  } as ViewStyle,
  teamName: {
    marginBottom: Theme.spacing.xs,
    color: Theme.colors.text,
  } as TextStyle,
  score: {
    color: Theme.colors.text,
  } as TextStyle,
  winner: {
    fontWeight: '600',
  } as TextStyle,
  status: {
    fontWeight: '500',
  } as TextStyle,
  winnerText: {
    color: Theme.colors.primary,
  } as TextStyle,
  emptyStateCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  } as ViewStyle,
  emptyStateText: {
    textAlign: 'center',
    marginVertical: Theme.spacing.xl,
    fontSize: Theme.typography.fontSizes.lg,
    color: Theme.colors.textSecondary,
  } as TextStyle,
  completedGamesActions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  } as ViewStyle,
  actionButton: {
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  } as ViewStyle,
  actionButtonText: {
    fontSize: Theme.typography.fontSizes.sm,
  } as TextStyle,
  checkbox: {
    width: Theme.spacing.sm,
    height: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  checkboxInner: {
    width: Theme.spacing.xs,
    height: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
  } as ViewStyle,
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
  } as ViewStyle,
  actionText: {
    color: Theme.colors.textSecondary,
  } as TextStyle,
  actionButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  } as ViewStyle,
  primaryButton: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  } as ViewStyle,
  primaryButtonText: {
    color: Theme.colors.button.text,
  } as TextStyle,
  secondaryButton: {
    backgroundColor: Theme.colors.textSecondary,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  } as ViewStyle,
  secondaryButtonText: {
    color: Theme.colors.button.text,
  } as TextStyle,
  deleteButton: {
    backgroundColor: Theme.colors.error,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  } as ViewStyle,
  deleteButtonText: {
    color: Theme.colors.button.text,
  } as TextStyle,
  noGamesText: {
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
  } as TextStyle,
});
