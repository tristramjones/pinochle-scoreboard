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
import {Game} from '../../types/game';
import {calculateTeamScores} from '../../utils/scoring';
import * as Storage from '../../utils/storage';

export default function GamesScreen() {
  const router = useRouter();
  const {currentGame} = useGame();
  const [completedGames, setCompletedGames] = useState<Game[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  const renderGameCard = (game: Game, isCompleted = false) => {
    const scores = calculateTeamScores(game);
    const winner = game.teams.reduce((prev, curr) =>
      scores[curr.id] > scores[prev.id] ? curr : prev,
    );

    return (
      <TouchableOpacity
        key={game.id}
        style={styles.gameCard}
        onPress={() =>
          router.push(isCompleted ? `/games/${game.id}` : '/games/current')
        }
      >
        <View style={styles.gameHeader}>
          <ThemedText type="label" style={[styles.date, styles.dateText]}>
            {formatDate(game.timestamp)}
          </ThemedText>
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
          style={{marginTop: Theme.spacing.sm}}
        />
      </View>

      {completedGames.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            Completed Games
          </ThemedText>
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
        shadowOffset: {width: 2, height: 3},
        shadowOpacity: 0.6,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  } as ViewStyle,
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
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
  emptyStateText: {
    textAlign: 'center',
    marginVertical: Theme.spacing.xl,
    fontSize: Theme.typography.fontSizes.lg,
    color: Theme.colors.textSecondary,
  } as TextStyle,
});
