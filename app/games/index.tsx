import {cardImages} from '../../constants/CardImages';
import {CardFrame} from '../../components/CardFrame';
import {OrnamentalRule} from '../../components/RoomMasthead';
import {TableScrollView} from '../../components/TableScrollView';
import {useRouter} from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
  ImageStyle,
  Platform,
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

export default function GamesScreen() {
  const router = useRouter();
  const {
    activeGames,
    completedGames,
    selectGame,
    isLoading,
    isReady,
    error,
    retryLoad,
  } = useGame();

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
        style={{
          marginBottom: Theme.spacing.md,
          opacity: isLoading ? Theme.button.disabledOpacity : 1,
        }}
        accessibilityRole="button"
        disabled={isLoading}
        activeOpacity={Theme.button.activeOpacity}
        accessibilityState={{disabled: isLoading}}
        onPress={async () => {
          if (isCompleted) {
            router.push(`/games/${game.id}`);
            return;
          }
          try {
            await selectGame(game.id);
            router.push('/games/current');
          } catch {
            Alert.alert('Unable to open game', 'Please try again.');
          }
        }}
      >
        <CardFrame style={styles.gameCard}>
          <View style={styles.cardContent}>
            <Image
              source={cardImages[game.cardImageIndex]}
              style={styles.cardImage}
              resizeMode="contain"
            />
            <ThemedText type="label" style={styles.dateText}>
              {formatDate(game.timestamp)} · {game.rounds.length}{' '}
              {game.rounds.length === 1 ? 'round' : 'rounds'}
            </ThemedText>
          </View>
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
        </CardFrame>
      </TouchableOpacity>
    );
  };

  return (
    <TableScrollView
      style={[styles.container, styles.containerThemed]}
      contentContainerStyle={styles.contentContainer}
    >
      {error && (
        <View style={{gap: Theme.spacing.sm, marginBottom: Theme.spacing.md}}>
          <ThemedText accessibilityRole="alert">
            {isReady
              ? 'Your last change could not be saved. Please try again.'
              : 'Could not load your games.'}
          </ThemedText>
          {!isReady && (
            <ThemedButton
              title="Retry Loading Games"
              loading={isLoading}
              variant="secondary"
              onPress={retryLoad}
            />
          )}
        </View>
      )}
      <View style={styles.section}>
        <ThemedText
          type="heading"
          accessibilityRole="header"
          style={styles.sectionTitle}
        >
          At the table
        </ThemedText>
        <ThemedText style={styles.sectionSubtitle}>One more hand.</ThemedText>
        {activeGames.map(game => renderGameCard(game))}
        {activeGames.length === 0 && (
          <ThemedText style={styles.emptyStateText}>
            {isLoading
              ? 'Opening the ledger…'
              : 'No games underway. Deal a new hand.'}
          </ThemedText>
        )}
        <ThemedButton
          title="Start New Game"
          disabled={isLoading || !isReady}
          onPress={() => router.push('/games/new')}
          size="lg"
          style={{marginTop: Theme.spacing.sm}}
        />
      </View>

      {completedGames.length > 0 && (
        <View style={styles.section}>
          <ThemedText
            type="heading"
            accessibilityRole="header"
            style={styles.sectionTitle}
          >
            The ledger
          </ThemedText>
          <OrnamentalRule />
          {completedGames.map(game => renderGameCard(game, true))}
        </View>
      )}
    </TableScrollView>
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
  sectionSubtitle: {
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: Theme.typography.fonts.italic,
    fontSize: 21,
    lineHeight: 30,
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
    fontSize: Theme.typography.fontSizes.xl,
    fontFamily: Theme.typography.fonts.bold,
    lineHeight: Theme.typography.fontSizes.xl * 1.3,
    color: Theme.colors.text,
  } as TextStyle,
  gameCard: {
    padding: 20,
    backgroundColor: Theme.card.background,
    ...Platform.select({
      ios: {
        shadowColor: Theme.card.shadow.shadowColor,
        shadowOffset: Theme.card.shadow.shadowOffset,
        shadowOpacity: Theme.card.shadow.shadowOpacity,
        shadowRadius: Theme.card.shadow.shadowRadius,
      },
      android: {
        elevation: Theme.card.shadow.elevation,
      },
    }),
  } as ViewStyle,
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.md,
  } as ViewStyle,
  cardImage: {
    width: 40,
    height: 60,
    borderRadius: Theme.borderRadius.sm,
  } as ImageStyle,
  dateText: {
    flex: 1,
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
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
    paddingRight: Theme.spacing.xs,
  } as ViewStyle,
  teamName: {
    color: Theme.colors.text,
    flex: 1,
    fontSize: Theme.typography.fontSizes.lg,
    fontFamily: Theme.typography.fonts.regular,
    lineHeight: 30,
  } as TextStyle,
  score: {
    color: Theme.colors.text,
    fontSize: Theme.typography.fontSizes.xl,
    fontFamily: Theme.typography.fonts.regular,
    textAlign: 'right',
    minWidth: 66,
    flexShrink: 0,
    lineHeight: 34,
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
