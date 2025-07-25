import * as Haptics from 'expo-haptics';
import {useLocalSearchParams, useRouter} from 'expo-router';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import {ThemedText} from '../../components/ThemedText';
import {Theme} from '../../constants/Theme';
import {useGame} from '../../contexts/GameContext';

export default function VictoryScreen() {
  const router = useRouter();
  const {clearGameOverData} = useGame();
  const params = useLocalSearchParams<{
    teamName: string;
    score: string;
  }>();

  useEffect(() => {
    // Play haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Automatically navigate back to games after celebration
    const timer = setTimeout(() => {
      router.replace('/games');
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearGameOverData();
    };
  }, [router, clearGameOverData]);

  if (!params.teamName || !params.score) {
    router.replace('/games');
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          🎉 Victory! 🎉
        </ThemedText>
        <ThemedText type="heading" style={styles.winner}>
          {params.teamName} Wins!
        </ThemedText>
        <ThemedText type="score" style={styles.score}>
          {params.score} points
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
