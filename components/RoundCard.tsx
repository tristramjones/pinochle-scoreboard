import React from 'react';
import {CardFrame} from './CardFrame';
import {calculateRoundPoints} from '../utils/scoring';
import {Platform, StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import {Theme} from '../constants/Theme';
import {Game} from '../types/game';
import {Round} from '../types/round';
import {ThemedText} from './ThemedText';

type RoundCardProps = {
  round: Round;
  game: Game;
  roundNumber: number;
};

export function RoundCard({round, game, roundNumber}: RoundCardProps) {
  const bidWinningTeam = game.teams.find(team => team.id === round.bidWinner);

  return (
    <CardFrame style={styles.roundCard}>
      <View style={styles.roundHeader}>
        <ThemedText type="subtitle" style={styles.roundTitle}>
          Round {roundNumber}
        </ThemedText>
        {round.moonShotAttempted ? (
          <ThemedText type="label" style={styles.bidText}>
            {bidWinningTeam?.name}{' '}
            {round.moonShotSuccessful ? 'made' : 'failed'} moon shot
          </ThemedText>
        ) : (
          <ThemedText type="label" style={styles.bidText}>
            {bidWinningTeam?.name} bid {round.bid}
          </ThemedText>
        )}
      </View>

      <View style={styles.scoreTable}>
        {game.teams.map(team => {
          const meldPoints = round.meld[team.id] || 0;
          const trickPoints = round.trickPoints[team.id] || 0;

          // For moon shots, show the actual points (+1500/-1500) in the tricks column
          const displayTrickPoints = round.moonShotAttempted
            ? team.id === round.bidWinner
              ? round.moonShotSuccessful
                ? 1500
                : -1500
              : 0
            : trickPoints;

          const isBidWinner = team.id === round.bidWinner;
          const roundTotal = calculateRoundPoints(round, team.id);

          // Calculate running score up to this round
          const runningScore = game.rounds
            .slice(0, roundNumber)
            .reduce((sum, r) => sum + calculateRoundPoints(r, team.id), 0);

          return (
            <View key={team.id} style={styles.teamResult}>
              <ThemedText
                type="subtitle"
                style={[styles.teamName, isBidWinner && styles.bidWinnerText]}
              >
                {team.name}
              </ThemedText>
              <View style={styles.tableRow}>
                {[
                  {
                    label: 'Meld',
                    value: round.moonShotAttempted ? '—' : meldPoints,
                  },
                  {label: 'Tricks', value: displayTrickPoints},
                  {label: 'Total', value: roundTotal},
                  {label: 'Score', value: runningScore},
                ].map(({label, value}) => (
                  <View key={label} style={styles.stat}>
                    <ThemedText type="label" style={styles.headerCell}>
                      {label}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.value,
                        label === 'Score' && styles.boldText,
                      ]}
                    >
                      {value}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </CardFrame>
  );
}

const styles = StyleSheet.create({
  roundCard: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.card.background,
    marginBottom: Theme.spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: Theme.shadows.card.shadowColor,
        shadowOffset: Theme.shadows.card.shadowOffset,
        shadowOpacity: Theme.shadows.card.shadowOpacity,
        shadowRadius: Theme.shadows.card.shadowRadius,
      },
      android: {
        elevation: Theme.shadows.card.elevation,
      },
    }),
  } as ViewStyle,
  roundHeader: {
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  } as ViewStyle,
  bidText: {
    flexShrink: 1,
    maxWidth: '100%',
    color: Theme.colors.card.textSecondary,
  } as TextStyle,
  scoreTable: {
    gap: Theme.spacing.sm,
  } as ViewStyle,
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  stat: {flex: 1, minWidth: 0, alignItems: 'center', gap: 4},
  value: {textAlign: 'center', color: Theme.colors.card.text},
  roundTitle: {color: Theme.colors.card.text},
  teamResult: {
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.card.border,
  },
  teamName: {
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'left',
    color: Theme.colors.card.text,
  },
  headerCell: {
    textAlign: 'center',
    fontSize: Theme.typography.fontSizes.xs,
    color: Theme.colors.card.text,
    textTransform: 'uppercase',
  } as TextStyle,
  bidWinnerText: {
    color: Theme.colors.card.accent,
  } as TextStyle,
  boldText: {
    fontFamily: Theme.typography.fonts.bold,
  } as TextStyle,
});
