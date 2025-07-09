import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

interface VictoryScreenProps {
  winningTeam: {
    name: string;
    score: number;
  };
}

export default function VictoryScreen({ winningTeam }: VictoryScreenProps) {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Play haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Fade in animation
    const fadeIn = Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });

    // Fade out animation
    const fadeOut = Animated.timing(opacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    });

    // Sequence the animations
    const timer = setTimeout(() => {
      Animated.sequence([
        fadeIn,
        Animated.delay(2000), // Show for 2 seconds
        fadeOut
      ]).start(() => {
        router.replace('/games');
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.content}>
        <Text style={styles.title}>🎉 Victory! 🎉</Text>
        <Text style={styles.teamName}>{winningTeam.name}</Text>
        <Text style={styles.score}>Final Score: {winningTeam.score}</Text>
      </View>
      <ConfettiCannon
        count={200}
        origin={{ x: -10, y: 0 }}
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
    color: '#fff',
    marginBottom: 20,
  },
  teamName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  score: {
    fontSize: 24,
    color: '#fff',
  },
}); 