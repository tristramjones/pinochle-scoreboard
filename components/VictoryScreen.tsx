import * as Haptics from 'expo-haptics';
import {useRouter} from 'expo-router';
import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import {Theme} from '../constants/Theme';
import {ThemedText} from './ThemedText';

interface VictoryScreenProps {
  winningTeam: {
    name: string;
    score: number;
  };
}

export default function VictoryScreen({winningTeam}: VictoryScreenProps) {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Play haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Fade in animation
    const fadeIn = Animated.timing(opacity, {
      toValue: 1,
      duration: Theme.animation.duration.normal,
      useNativeDriver: true,
    });

    // Fade out animation
    const fadeOut = Animated.timing(opacity, {
      toValue: 0,
      duration: Theme.animation.duration.normal,
      useNativeDriver: true,
    });

    // Sequence the animations
    const timer = setTimeout(() => {
      Animated.sequence([
        fadeIn,
        Animated.delay(2000), // Show for 2 seconds
        fadeOut,
      ]).start(() => {
        router.replace('/games');
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [opacity, router]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          backgroundColor: 'rgba(0, 0, 0, 0.9)', // Keep this hardcoded for the overlay effect
        },
      ]}
    >
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          🎉 Victory! 🎉
        </ThemedText>
        <ThemedText type="heading" style={styles.teamName}>
          {winningTeam.name}
        </ThemedText>
        <ThemedText type="score" style={styles.score}>
          Final Score: {winningTeam.score}
        </ThemedText>
      </View>
      <ConfettiCannon
        count={200}
        origin={{x: -10, y: 0}}
        autoStart={true}
        fadeOut={true}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  title: {
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  teamName: {
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  score: {
    textAlign: 'center',
  },
});
