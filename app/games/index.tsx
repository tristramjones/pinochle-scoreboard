import {useFocusEffect} from '@react-navigation/native';
import {useRouter} from 'expo-router';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  Image,
  ImageStyle,
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

const cardImages = [
  require('../../assets/images/hearts_ace.png'),
  require('../../assets/images/diamonds_jack.png'),
  require('../../assets/images/clubs_king.png'),
  require('../../assets/images/spades_queen.png'),
];

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
    const sortedTeams = [...game.teams].sort(
      (a, b) => scores[b.id] - scores[a.id],
    );

    return (
      <TouchableOpacity
        key={game.id}
        style={styles.gameCard}
        onPress={() =>
          router.push(isCompleted ? `/games/${game.id}` : '/games/current')
        }
      >
        <View style={styles.cardContent}>
          <Image
            source={cardImages[game.cardImageIndex]}
            style={styles.cardImage}
            resizeMode="contain"
          />
          <View style={styles.cardDetails}>
            <ThemedText type="label" style={styles.dateText}>
              {formatDate(game.timestamp)}
            </ThemedText>
            <View style={styles.teamsContainer}>
              {sortedTeams.map((team, index) => (
                <View key={team.id} style={styles.teamScore}>
                  <ThemedText
                    type="subtitle"
                    style={[styles.teamName, index === 0 && styles.winnerText]}
                  >
                    {team.name}
                  </ThemedText>
                  <ThemedText
                    type="score"
                    style={[styles.score, index === 0 && styles.winnerText]}
                  >
                    {scores[team.id]}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[styles.container, styles.containerThemed]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.section}>
        <ThemedText type="title" style={styles.mainTitle}>
          Current Game
        </ThemedText>
        {currentGame ? (
          renderGameCard(currentGame)
        ) : (
          <>
            <ThemedText type="subtitle" style={styles.emptyStateText}>
              No game in progress
            </ThemedText>
            <ThemedButton
              title="New Game"
              onPress={() => router.push('/games/new')}
              variant="primary"
              size="md"
              style={{marginTop: Theme.spacing.sm}}
            />
          </>
        )}
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
  } as ViewStyle,
  containerThemed: {
    backgroundColor: Theme.colors.background,
  } as ViewStyle,
  contentContainer: {
    padding: Theme.spacing.lg,
  } as ViewStyle,
  section: {
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  mainTitle: {
    marginBottom: Theme.spacing.sm,
    fontSize: Theme.typography.fontSizes.xxl,
    fontFamily: Theme.typography.fonts.bold,
    lineHeight: Theme.typography.fontSizes.xxl * 1.3,
  } as TextStyle,
  sectionTitle: {
    marginBottom: Theme.spacing.xs,
    fontSize: Theme.typography.fontSizes.xl,
    fontFamily: Theme.typography.fonts.bold,
    lineHeight: Theme.typography.fontSizes.xl * 1.3,
  } as TextStyle,
  gameCard: {
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.card.background,
    marginBottom: Theme.spacing.md,
  } as ViewStyle,
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
  } as ViewStyle,
  cardImage: {
    width: 60,
    height: 90,
    borderRadius: Theme.borderRadius.sm,
  } as ImageStyle,
  cardDetails: {
    flex: 1,
    justifyContent: 'center',
  } as ViewStyle,
  dateText: {
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'right',
    fontSize: Theme.typography.fontSizes.md,
    fontFamily: Theme.typography.fonts.regular,
  } as TextStyle,
  teamsContainer: {
    gap: Theme.spacing.xs,
  } as ViewStyle,
  teamScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingRight: Theme.spacing.xs,
  } as ViewStyle,
  teamName: {
    color: Theme.colors.text,
    flex: 1,
    fontSize: Theme.typography.fontSizes.xl,
    fontFamily: Theme.typography.fonts.regular,
    lineHeight: Theme.typography.fontSizes.xl * 1.1,
  } as TextStyle,
  score: {
    color: Theme.colors.text,
    fontSize: Theme.typography.fontSizes.xl,
    fontFamily: Theme.typography.fonts.regular,
    textAlign: 'right',
    minWidth: 60,
    lineHeight: Theme.typography.fontSizes.xl * 1.1,
  } as TextStyle,
  winnerText: {
    color: Theme.colors.text,
    fontFamily: Theme.typography.fonts.bold,
  } as TextStyle,
  emptyStateText: {
    textAlign: 'center',
    marginVertical: Theme.spacing.xl,
    fontSize: Theme.typography.fontSizes.lg,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.typography.fonts.regular,
  } as TextStyle,
});
