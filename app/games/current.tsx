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
      <View style={styles.scoreHeader}>
        <View style={styles.scoreboardTeams}>
          {currentGame.teams.map(team => (
            <View key={team.id} style={styles.teamScoreContainer}>
              <ThemedText type="subtitle" style={styles.teamScoreName}>
                {team.name}
              </ThemedText>
              <ThemedText type="title" style={styles.teamScoreValue}>
                {calculateTeamScore(currentGame, team.id)}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <ThemedButton
        title="New Round"
        onPress={() => router.push('/games/round/new')}
        variant="primary"
        size="md"
        style={styles.newRoundButton}
      />

      <View style={styles.previousRounds}>
        <ThemedText type="heading" style={styles.sectionTitle}>
          Previous Rounds
        </ThemedText>
        {currentGame.rounds.length > 0 ? (
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
        ) : (
          <ThemedText type="subtitle" style={styles.emptyStateText}>
            No completed rounds
          </ThemedText>
        )}
      </View>
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
  scoreHeader: {
    marginBottom: Theme.spacing.xl,
    paddingBottom: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.card.border,
  } as ViewStyle,
  scoreboardTeams: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  } as ViewStyle,
  teamScoreContainer: {
    alignItems: 'center',
    gap: Theme.spacing.sm,
  } as ViewStyle,
  teamScoreName: {
    fontSize: Theme.typography.fontSizes.lg,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  } as TextStyle,
  teamScoreValue: {
    fontSize: Theme.typography.fontSizes.xxl,
    fontFamily: Theme.typography.fonts.bold,
    color: Theme.colors.text,
    textAlign: 'center',
  } as TextStyle,
  newRoundButton: {
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  previousRounds: {
    // Remove gap property as it's adding extra space
  } as ViewStyle,
  sectionTitle: {
    marginBottom: Theme.spacing.xs,
    fontSize: Theme.typography.fontSizes.xl,
    fontFamily: Theme.typography.fonts.bold,
    lineHeight: Theme.typography.fontSizes.xl * 1.3,
  } as TextStyle,
  roundsContainer: {
    gap: Theme.spacing.md,
  } as ViewStyle,
  emptyStateText: {
    textAlign: 'center',
    color: Theme.colors.textSecondary,
  } as TextStyle,
});
