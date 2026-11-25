import {TeamScoreboard} from '../../components/TeamScoreboard';
import {OrnamentalRule} from '../../components/RoomMasthead';
import {TableScrollView} from '../../components/TableScrollView';
import {useRouter} from 'expo-router';
import React from 'react';
import {Alert, StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import {RoundCard} from '../../components/RoundCard';
import {ThemedButton} from '../../components/ThemedButton';
import {ThemedText} from '../../components/ThemedText';
import {ThemedView} from '../../components/ThemedView';
import {Theme} from '../../constants/Theme';
import {useGame} from '../../contexts/GameContext';

export default function CurrentGameScreen() {
  const router = useRouter();
  const {currentGame, endGame, deleteGame, isLoading} = useGame();
  const confirmFinish = (archive: boolean) =>
    Alert.alert(
      archive ? 'End this game?' : 'Delete this game?',
      archive
        ? 'Save the scores as they stand in your ledger.'
        : 'This permanently removes this game and its rounds.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: archive ? 'End Game' : 'Delete Game',
          style: archive ? 'default' : 'destructive',
          onPress: () => {
            (archive ? endGame() : deleteGame()).catch(() =>
              Alert.alert(
                'Unable to save',
                'Your game is still here. Please try again.',
              ),
            );
          },
        },
      ],
    );

  if (!currentGame) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">
          {isLoading ? 'Opening the table…' : 'No Current Game'}
        </ThemedText>
        <ThemedButton title="Back to Games" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  return (
    <TableScrollView
      style={[styles.container, styles.containerThemed]}
      contentContainerStyle={styles.contentContainer}
    >
      <ThemedText type="title" style={styles.phaseTitle}>
        Tonight’s game
      </ThemedText>

      <ThemedText type="label" style={styles.dateText}>
        {new Date(currentGame.timestamp).toLocaleDateString()}
      </ThemedText>

      <TeamScoreboard game={currentGame} />

      <ThemedButton
        title="Add a round"
        disabled={isLoading}
        onPress={() => router.push('/games/round/new')}
        variant="primary"
        size="lg"
        style={styles.newRoundButton}
      />

      {currentGame.rounds.length > 0 && (
        <View style={styles.roundsContainer}>
          <ThemedText type="heading" style={{textAlign: 'center'}}>
            Around the table
          </ThemedText>
          <OrnamentalRule />
          {currentGame.rounds.map((round, index) => (
            <RoundCard
              key={round.id}
              round={round}
              game={currentGame}
              roundNumber={index + 1}
            />
          ))}
        </View>
      )}
      <OrnamentalRule />
      <View style={{gap: Theme.spacing.sm, marginBottom: Theme.spacing.xl}}>
        <ThemedButton
          title="End Game & Save Scores"
          variant="secondary"
          disabled={isLoading}
          onPress={() => confirmFinish(true)}
        />
        <ThemedButton
          title="Delete Game"
          variant="destructive"
          disabled={isLoading}
          onPress={() => confirmFinish(false)}
        />
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
    fontSize: 36,
    fontFamily: Theme.typography.fonts.bold,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
    color: Theme.colors.text,
  } as TextStyle,
  dateText: {
    fontSize: Theme.typography.fontSizes.lg,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  } as TextStyle,
  newRoundButton: {
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  roundsContainer: {
    gap: Theme.spacing.md,
  } as ViewStyle,
});
