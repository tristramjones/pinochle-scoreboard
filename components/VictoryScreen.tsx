import * as Haptics from 'expo-haptics';
import {useRouter} from 'expo-router';
import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import {useTheme} from '../hooks/useTheme';

interface VictoryScreenProps {
  winningTeam: {
    name: string;
    score: number;
  };
}

export default function VictoryScreen({winningTeam}: VictoryScreenProps) {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const {theme, colors} = useTheme();

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
        <Text style={[styles.title, {color: colors.text}]}>🎉 Victory! 🎉</Text>
        <Text style={[styles.teamName, {color: colors.text}]}>
          {winningTeam.name}
        </Text>
        <Text style={[styles.score, {color: colors.text}]}>
          Final Score: {winningTeam.score}
        </Text>
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
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  teamName: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  score: {
    fontSize: 24,
  },
});
