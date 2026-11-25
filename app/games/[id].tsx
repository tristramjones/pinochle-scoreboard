import {TeamScoreboard} from '../../components/TeamScoreboard';
import {TableScrollView} from '../../components/TableScrollView';
import {useLocalSearchParams, useRouter} from 'expo-router';
import React from 'react';
import {Alert, StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import {RoundCard} from '../../components/RoundCard';
import {ThemedButton} from '../../components/ThemedButton';
import {ThemedText} from '../../components/ThemedText';
import {Theme} from '../../constants/Theme';
import {findWinningTeam} from '../../utils/scoring';
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
          title="Back to games"
          onPress={() => router.back()}
          variant="primary"
        />
      </View>
    );
  }

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

      <TeamScoreboard game={game} winnerId={winner?.id} />

      <ThemedButton
        title="Delete game"
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
                text: 'Delete game',
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
  rounds: {
    gap: Theme.spacing.md,
  } as ViewStyle,
});
