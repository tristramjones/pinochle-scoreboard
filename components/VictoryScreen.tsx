import * as Haptics from 'expo-haptics';
import React, {useEffect, useState} from 'react';
import {
  AccessibilityInfo,
  Animated,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import {TableScrollView} from './TableScrollView';
import {CardFrame} from './CardFrame';
import {OrnamentalRule} from './RoomMasthead';
import {ThemedButton} from './ThemedButton';
import {ThemedText} from './ThemedText';
import {Theme} from '../constants/Theme';

interface VictoryScreenProps {
  winningTeam: {name: string; score: number};
  onContinue: () => void;
}
const confettiColors = ['#E4BC73', '#F8EACC', '#20533E', '#A84832'];

export default function VictoryScreen({
  winningTeam,
  onContinue,
}: VictoryScreenProps) {
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [opacity] = useState(() => new Animated.Value(0));
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    let active = true;
    const fade = Animated.timing(opacity, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    });
    AccessibilityInfo.isReduceMotionEnabled()
      .then(reduced => {
        if (!active) return;
        if (reduced) opacity.setValue(1);
        else {
          fade.start();
          setShowConfetti(true);
        }
      })
      .catch(() => {
        if (active) opacity.setValue(1);
      });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    return () => {
      active = false;
      fade.stop();
    };
  }, [opacity]);

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <TableScrollView contentContainerStyle={styles.content}>
        <Animated.View style={[styles.result, {opacity}]}>
          <ThemedText style={styles.eyebrow}>A GAME TO REMEMBER</ThemedText>
          <ThemedText
            type="title"
            style={styles.title}
            accessibilityRole="header"
          >
            Victory!
          </ThemedText>
          <OrnamentalRule />
          <CardFrame style={styles.winnerCard}>
            <ThemedText
              type="heading"
              style={styles.winner}
              accessibilityRole="header"
              accessibilityLiveRegion="polite"
            >
              {winningTeam.name} Wins!
            </ThemedText>
            <ThemedText type="score" style={styles.score}>
              {winningTeam.score.toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.detail}>final score</ThemedText>
          </CardFrame>
          <ThemedText style={styles.saved}>
            The final scores are saved in the ledger.
          </ThemedText>
          <ThemedButton
            title="Back to the table"
            onPress={onContinue}
            size="lg"
            style={styles.continue}
          />
        </Animated.View>
      </TableScrollView>
      {showConfetti && (
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.confetti}
        >
          <ConfettiCannon
            count={120}
            origin={{x: width / 2, y: 0}}
            colors={confettiColors}
            autoStartDelay={250}
            fadeOut
          />
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Theme.colors.background},
  content: {
    flexGrow: 1,
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  result: {flexGrow: 1, justifyContent: 'center'},
  eyebrow: {
    color: Theme.colors.textSecondary,
    letterSpacing: 2,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  title: {
    color: Theme.colors.accent.gold,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  winnerCard: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
    marginVertical: Theme.spacing.md,
  },
  winner: {textAlign: 'center', color: Theme.colors.text},
  score: {
    fontSize: 52,
    lineHeight: 72,
    color: Theme.colors.accent.gold,
    marginTop: Theme.spacing.md,
  },
  detail: {color: Theme.colors.textSecondary, fontStyle: 'italic'},
  saved: {
    textAlign: 'center',
    color: Theme.colors.textSecondary,
    marginVertical: Theme.spacing.md,
  },
  continue: {marginTop: Theme.spacing.md},
  confetti: {...StyleSheet.absoluteFill, overflow: 'hidden'},
});
