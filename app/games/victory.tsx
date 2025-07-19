import * as Haptics from 'expo-haptics';
import {useRouter} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import {ThemedText} from '../../components/ThemedText';
import {Theme} from '../../constants/Theme';
import {Game} from '../../types/game';
import {calculateTeamScore} from '../../utils/scoring';
import * as Storage from '../../utils/storage';

export default function VictoryScreen() {
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    const loadGame = async () => {
      try {
        // Get the most recent game from history
        const history = await Storage.getGameHistory();
        if (history.length > 0) {
          const lastGame = history[history.length - 1];
          setGame(lastGame);
        } else {
          router.replace('/games');
        }
      } catch (error) {
        console.error('Error loading game:', error);
        router.replace('/games');
      }
    };

    loadGame();

    // Play haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Automatically navigate back to games after celebration
    const timer = setTimeout(() => {
      router.replace('/games');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!game) return null;

  // Find the winning team (highest score)
  const scores = game.teams.map(team => ({
    team,
    score: calculateTeamScore(game, team.id),
  }));
  const winner = scores.reduce((prev, curr) =>
    curr.score > prev.score ? curr : prev,
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          🎉 Victory! 🎉
        </ThemedText>
        <ThemedText type="heading" style={styles.winner}>
          {winner.team.name} Wins!
        </ThemedText>
        <View style={styles.scores}>
          {scores.map(({team, score}) => (
            <ThemedText key={team.id} type="heading" style={styles.score}>
              {team.name}: {score}
            </ThemedText>
          ))}
        </View>
      </View>
      <ConfettiCannon
        count={200}
        origin={{x: -10, y: 0}}
        autoStart={true}
        fadeOut={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  content: {
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  title: {
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  winner: {
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
    color: Theme.colors.primary,
  },
  scores: {
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  score: {
    textAlign: 'center',
    color: Theme.colors.textSecondary,
  },
});
