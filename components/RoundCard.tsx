import React from 'react';
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
    <View style={styles.roundCard}>
      <View style={styles.roundHeader}>
        <ThemedText type="subtitle">Round {roundNumber}</ThemedText>
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
        <View style={styles.tableRow}>
          <ThemedText
            type="label"
            style={[styles.tableCell, styles.teamCell, styles.headerCell]}
          />
          <ThemedText
            type="label"
            style={[styles.tableCell, styles.headerCell]}
          >
            MELD
          </ThemedText>
          <ThemedText
            type="label"
            style={[styles.tableCell, styles.headerCell]}
          >
            TRICKS
          </ThemedText>
          <ThemedText
            type="label"
            style={[styles.tableCell, styles.headerCell]}
          >
            TOTAL
          </ThemedText>
          <ThemedText
            type="label"
            style={[styles.tableCell, styles.headerCell]}
          >
            SCORE
          </ThemedText>
        </View>

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

          // For moon shots, total is the same as trick points (no meld)
          const roundTotal = round.moonShotAttempted
            ? displayTrickPoints
            : meldPoints + trickPoints;

          const isBidWinner = team.id === round.bidWinner;

          // Calculate running score up to this round
          const runningScore = game.rounds
            .slice(0, roundNumber)
            .reduce((sum, r) => {
              if (r.moonShotAttempted) {
                if (r.bidWinner === team.id) {
                  return sum + (r.moonShotSuccessful ? 1500 : -1500);
                }
                return sum;
              }

              const roundPoints =
                (r.meld[team.id] || 0) + (r.trickPoints[team.id] || 0);
              if (r.bidWinner === team.id && roundPoints < r.bid) {
                return sum - r.bid;
              }
              return sum + roundPoints;
            }, 0);

          return (
            <View key={team.id} style={styles.tableRow}>
              <ThemedText
                type="subtitle"
                style={[
                  styles.tableCell,
                  styles.teamCell,
                  isBidWinner && styles.bidWinnerText,
                ]}
              >
                {team.name}
              </ThemedText>
              <ThemedText type="default" style={styles.tableCell}>
                {round.moonShotAttempted ? '-' : meldPoints}
              </ThemedText>
              <ThemedText type="default" style={styles.tableCell}>
                {displayTrickPoints}
              </ThemedText>
              <ThemedText type="default" style={styles.tableCell}>
                {roundTotal}
              </ThemedText>
              <ThemedText
                type="default"
                style={[styles.tableCell, styles.boldText]}
              >
                {runningScore}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  roundCard: {
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.card.background,
    marginBottom: Theme.spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: Theme.card.shadow.shadowColor,
        shadowOffset: Theme.card.shadow.shadowOffset,
        shadowOpacity: Theme.card.shadow.shadowOpacity,
        shadowRadius: Theme.card.shadow.shadowRadius,
      },
      android: {
        elevation: Theme.card.shadow.elevation,
      },
    }),
  } as ViewStyle,
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  } as ViewStyle,
  bidText: {
    color: Theme.colors.textSecondary,
  } as TextStyle,
  scoreTable: {
    gap: Theme.spacing.sm,
  } as ViewStyle,
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  tableCell: {
    flex: 1,
    textAlign: 'center',
  } as TextStyle,
  teamCell: {
    flex: 1.5,
    textAlign: 'left',
  } as TextStyle,
  headerCell: {
    fontSize: Theme.typography.fontSizes.xs,
    color: Theme.colors.text,
    textTransform: 'uppercase',
  } as TextStyle,
  bidWinnerText: {
    color: Theme.colors.accent.burgundy,
  } as TextStyle,
  boldText: {
    fontFamily: Theme.typography.fonts.bold,
  } as TextStyle,
});
