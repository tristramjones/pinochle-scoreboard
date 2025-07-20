import {useRouter} from 'expo-router';
import React from 'react';
import {ScrollView, StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import {RoundCard} from '../../components/RoundCard';
import {ThemedButton} from '../../components/ThemedButton';
import {ThemedText} from '../../components/ThemedText';
import {ThemedView} from '../../components/ThemedView';
import {Theme} from '../../constants/Theme';
import {useGame} from '../../contexts/GameContext';
import {calculateTeamScore} from '../../utils/scoring';

export default function CurrentGameScreen() {
  const router = useRouter();
  const {currentGame} = useGame();

  if (!currentGame) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">No Current Game</ThemedText>
        <ThemedButton title="Back to Games" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, styles.containerThemed]}
      contentContainerStyle={styles.contentContainer}
    >
      <ThemedText type="title" style={styles.phaseTitle}>
        Current Game
      </ThemedText>

      <ThemedText type="label" style={styles.dateText}>
        {new Date(currentGame.timestamp).toLocaleDateString()}
      </ThemedText>

      <View style={styles.scoreboardTeams}>
        {currentGame.teams.map(team => (
          <View key={team.id} style={styles.teamColumn}>
            <ThemedText type="heading" style={styles.teamName}>
              {team.name}
            </ThemedText>
            <ThemedText type="heading" style={styles.scoreValue}>
              {calculateTeamScore(currentGame, team.id)}
            </ThemedText>
          </View>
        ))}
      </View>

      <ThemedButton
        title="New Round"
        onPress={() => router.push('/games/round/new')}
        variant="primary"
        size="lg"
        style={styles.newRoundButton}
      />

      {currentGame.rounds.length > 0 && (
        <View style={styles.roundsContainer}>
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
    marginBottom: Theme.spacing.xl,
  } as TextStyle,
  scoreboardTeams: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  teamColumn: {
    alignItems: 'center',
  } as ViewStyle,
  teamName: {
    fontSize: Theme.typography.fontSizes.xl,
    fontFamily: Theme.typography.fonts.bold,
    color: Theme.colors.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  } as TextStyle,
  scoreValue: {
    fontSize: Theme.typography.fontSizes.xl,
    fontFamily: Theme.typography.fonts.bold,
    color: Theme.colors.primary,
    textAlign: 'center',
  } as TextStyle,
  newRoundButton: {
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  roundsContainer: {
    gap: Theme.spacing.md,
  } as ViewStyle,
});
