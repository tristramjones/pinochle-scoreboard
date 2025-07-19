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
    <ScrollView style={[styles.container, styles.containerThemed]}>
      <View style={styles.header}>
        <ThemedText type="label" style={styles.dateText}>
          {formatDate(game.timestamp)}
        </ThemedText>
        <View style={styles.teams}>
          {game.teams.map(team => (
            <View key={team.id} style={styles.teamScore}>
              <ThemedText
                type="subtitle"
                style={[
                  styles.teamName,
                  team.id === winner.id && styles.winnerText,
                ]}
              >
                {team.name}
                {team.id === winner.id && ' 🏆'}
              </ThemedText>
              <ThemedText
                type="score"
                style={[
                  styles.score,
                  team.id === winner.id && styles.winnerText,
                ]}
              >
                {scores[team.id]} points
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.rounds}>
        <ThemedText type="heading">Rounds</ThemedText>
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
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  containerThemed: {
    backgroundColor: Theme.colors.background,
  } as ViewStyle,
  header: {
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  dateText: {
    marginBottom: Theme.spacing.xs,
    color: Theme.colors.textSecondary,
  } as TextStyle,
  teams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  } as ViewStyle,
  teamScore: {
    flex: 1,
    alignItems: 'center',
  } as ViewStyle,
  teamName: {
    marginBottom: Theme.spacing.xs,
  } as TextStyle,
  score: {
    marginBottom: Theme.spacing.xs,
  } as TextStyle,
  winnerText: {
    color: Theme.colors.primary,
  } as TextStyle,
  rounds: {
    gap: Theme.spacing.md,
  } as ViewStyle,
});
