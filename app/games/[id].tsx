import {useLocalSearchParams, useRouter} from 'expo-router';
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import {RoundCard} from '../../components/RoundCard';
import {ThemedButton} from '../../components/ThemedButton';
import {ThemedText} from '../../components/ThemedText';
import {Theme} from '../../constants/Theme';
import {Game} from '../../types/game';
import {calculateTeamScores} from '../../utils/scoring';
import * as Storage from '../../utils/storage';

export default function GameDetailsScreen() {
  const {id} = useLocalSearchParams();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);

  const loadGame = useCallback(async () => {
    try {
      const history = await Storage.getGameHistory();
      const foundGame = history.find(g => g.id === id);
      setGame(foundGame || null);
    } catch (error) {
      console.error('Error loading game:', error);
    }
  }, [id]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (!game) {
    return (
      <View style={[styles.container, styles.containerThemed]}>
        <ThemedText type="heading">Game not found</ThemedText>
        <ThemedButton
          title="Back to Games"
          onPress={() => router.back()}
          variant="primary"
        />
      </View>
    );
  }

  const scores = calculateTeamScores(game);
  const winner = game.teams.reduce((prev, curr) =>
    scores[curr.id] > scores[prev.id] ? curr : prev,
  );

  return (
    <ScrollView
      style={[styles.container, styles.containerThemed]}
      contentContainerStyle={styles.contentContainer}
    >
      <ThemedText type="title" style={styles.phaseTitle}>
        Game Details
      </ThemedText>

      <ThemedText type="label" style={styles.dateText}>
        {formatDate(game.timestamp)}
      </ThemedText>

      <View style={styles.scoreboardTeams}>
        {game.teams.map(team => (
          <View key={team.id} style={styles.teamColumn}>
            <View style={styles.teamNameContainer}>
              <ThemedText
                type="heading"
                style={[
                  styles.teamName,
                  team.id === winner.id && styles.winnerText,
                ]}
              >
                {team.name}
              </ThemedText>
              {team.id === winner.id && (
                <ThemedText style={styles.trophyIcon}>🏆</ThemedText>
              )}
            </View>
            <ThemedText
              type="heading"
              style={[
                styles.scoreValue,
                team.id === winner.id && styles.winnerText,
              ]}
            >
              {scores[team.id]}
            </ThemedText>
          </View>
        ))}
      </View>

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
  teamNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
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
    color: Theme.colors.primary, // No change needed since we want all text in primary color
  } as TextStyle,
  trophyIcon: {
    fontSize: Theme.typography.fontSizes.lg,
  } as TextStyle,
  rounds: {
    gap: Theme.spacing.md,
  } as ViewStyle,
});
