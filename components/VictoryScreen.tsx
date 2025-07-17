import * as Haptics from 'expo-haptics';
import {useRouter} from 'expo-router';
import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import {useTheme} from '../hooks/useTheme';
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
  const theme = useTheme();

  useEffect(() => {
    // Play haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Fade in animation
    const fadeIn = Animated.timing(opacity, {
      toValue: 1,
      duration: theme.animation.duration.normal,
      useNativeDriver: true,
    });

    // Fade out animation
    const fadeOut = Animated.timing(opacity, {
      toValue: 0,
      duration: theme.animation.duration.normal,
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
  }, [opacity, router, theme.animation.duration.normal]);

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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    marginBottom: 20,
  },
  teamName: {
    marginBottom: 16,
  },
  score: {
    marginBottom: 8,
  },
});
