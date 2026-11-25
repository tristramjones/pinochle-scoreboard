import {CardFrame} from '../../components/CardFrame';
import {TableScrollView} from '../../components/TableScrollView';
import {useLocalSearchParams, useRouter} from 'expo-router';
import React from 'react';
import {Alert, StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import {RoundCard} from '../../components/RoundCard';
import {ThemedButton} from '../../components/ThemedButton';
import {ThemedText} from '../../components/ThemedText';
import {Theme} from '../../constants/Theme';
import {calculateTeamScores, findWinningTeam} from '../../utils/scoring';
import {useGame} from '../../contexts/GameContext';

export default function GameDetailsScreen() {
  const {id} = useLocalSearchParams();
  const router = useRouter();
  const {completedGames, isLoading, deleteCompletedGame} = useGame();
  const game = completedGames.find(g => g.id === id) ?? null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (!game) {
    return (
      <View style={[styles.container, styles.containerThemed]}>
        <ThemedText type="heading">
          {isLoading ? 'Opening the ledger…' : 'Game not found'}
        </ThemedText>
        <ThemedButton
          title="Back to Games"
          onPress={() => router.back()}
          variant="primary"
        />
      </View>
    );
  }

  const scores = calculateTeamScores(game);
  const winner = game.endedEarly ? null : findWinningTeam(game);

  return (
    <TableScrollView
      style={[styles.container, styles.containerThemed]}
      contentContainerStyle={styles.contentContainer}
    >
      <ThemedText type="title" style={styles.phaseTitle}>
        Game Details
      </ThemedText>

      <ThemedText type="label" style={styles.dateText}>
        {formatDate(game.timestamp)}
        {game.endedEarly ? ' · Ended early' : ''}
      </ThemedText>

      <View style={styles.scoreboardTeams}>
        {game.teams.map(team => (
          <CardFrame key={team.id} style={styles.teamColumn}>
            <View style={styles.teamNameContainer}>
              <ThemedText
                type="heading"
                style={[
                  styles.teamName,
                  team.id === winner?.id && styles.winnerText,
                ]}
              >
                {team.name}
              </ThemedText>
              {team.id === winner?.id && (
                <ThemedText style={styles.trophyIcon}>🏆</ThemedText>
              )}
            </View>
            <ThemedText
              type="heading"
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                styles.scoreValue,
                team.id === winner?.id && styles.winnerText,
              ]}
            >
              {scores[team.id]}
            </ThemedText>
          </CardFrame>
        ))}
      </View>

      <ThemedButton
        title="Delete Game"
        variant="destructive"
        disabled={isLoading}
        style={{marginBottom: Theme.spacing.xl}}
        onPress={() =>
          Alert.alert(
            'Delete this completed game?',
            'Permanently remove this game and all its rounds from this device, including any local backup copy. This cannot be undone.',
            [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Delete Game',
                style: 'destructive',
                onPress: () => {
                  deleteCompletedGame(game.id).catch(() =>
                    Alert.alert('Unable to delete game', 'Please try again.'),
                  );
                },
              },
            ],
          )
        }
      />

      <View style={styles.rounds}>
        {game.rounds.map((round, index) => (
          <RoundCard
            key={round.id}
            round={round}
            game={game}
            roundNumber={index + 1}
          />
        ))}
      </View>
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
  phaseTitle: {
    fontSize: Theme.typography.fontSizes.xxl,
    fontFamily: Theme.typography.fonts.bold,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
    color: Theme.colors.primary,
  } as TextStyle,
  dateText: {
    fontSize: Theme.typography.fontSizes.lg,
    color: Theme.colors.accent.burgundy,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  } as TextStyle,
  scoreboardTeams: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  teamColumn: {
    flex: 1,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.lg,
    alignItems: 'center',
  } as ViewStyle,
  teamNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
    paddingVertical: Theme.spacing.xs,
  } as ViewStyle,
  teamName: {
    fontSize: Theme.typography.fontSizes.xl,
    fontFamily: Theme.typography.fonts.bold,
    color: Theme.colors.primary,
    textAlign: 'center',
  } as TextStyle,
  scoreValue: {
    fontSize: Theme.typography.fontSizes.xl,
    fontFamily: Theme.typography.fonts.bold,
    color: Theme.colors.primary,
    textAlign: 'center',
  } as TextStyle,
  winnerText: {
    color: Theme.colors.primary,
  } as TextStyle,
  trophyIcon: {
    fontSize: Theme.typography.fontSizes.lg,
    lineHeight: Theme.typography.fontSizes.xl,
  } as TextStyle,
  rounds: {
    gap: Theme.spacing.md,
  } as ViewStyle,
});
