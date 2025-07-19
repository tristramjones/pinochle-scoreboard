import * as Haptics from 'expo-haptics';
import {useRouter} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import {ThemedText} from '../../components/ThemedText';
import {Theme} from '../../constants/Theme';
import {calculateTeamScore} from '../../utils/scoring';
import * as Storage from '../../utils/storage';

export default function VictoryScreen() {
  const router = useRouter();
  const [winningTeam, setWinningTeam] = useState<{
    name: string;
    score: number;
  } | null>(null);

  useEffect(() => {
    const loadWinningTeam = async () => {
      try {
        // Get the most recent game from history
        const history = await Storage.getGameHistory();
        if (history.length > 0) {
          const lastGame = history[history.length - 1];
          // Find the winning team
          const scores = lastGame.teams.map(team => ({
            team,
            score: calculateTeamScore(lastGame, team.id),
          }));
          const winner = scores.reduce((prev, curr) =>
            curr.score > prev.score ? curr : prev,
          );
          setWinningTeam({
            name: winner.team.name,
            score: winner.score,
          });
        } else {
          router.replace('/games');
        }
      } catch (error) {
        console.error('Error loading game:', error);
        router.replace('/games');
      }
    };

    loadWinningTeam();

    // Play haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Automatically navigate back to games after celebration
    const timer = setTimeout(() => {
      router.replace('/games');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!winningTeam) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          🎉 Victory! 🎉
        </ThemedText>
        <ThemedText type="heading" style={styles.winner}>
          {winningTeam.name} Wins!
        </ThemedText>
        <ThemedText type="score" style={styles.score}>
          {winningTeam.score} points
        </ThemedText>
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
  score: {
    textAlign: 'center',
    color: Theme.colors.textSecondary,
  },
});
