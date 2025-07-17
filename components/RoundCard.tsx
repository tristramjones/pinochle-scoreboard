import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
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
    <View style={[styles.roundCard, styles.roundCardThemed]}>
      <View style={styles.roundHeader}>
        <ThemedText type="subtitle">Round {roundNumber}</ThemedText>
        <ThemedText type="label" style={styles.bidText}>
          {bidWinningTeam?.name} bid {round.bid}
        </ThemedText>
      </View>

      <View style={styles.scoreTable}>
        <View style={styles.tableRow}>
          <ThemedText
            type="label"
            style={[styles.tableCell, styles.teamCell]}
          />
          <ThemedText type="label" style={styles.tableCell}>
            Meld
          </ThemedText>
          <ThemedText type="label" style={styles.tableCell}>
            Tricks
          </ThemedText>
          <ThemedText type="label" style={styles.tableCell}>
            Total
          </ThemedText>
          <ThemedText type="label" style={styles.tableCell}>
            Score
          </ThemedText>
        </View>

        {game.teams.map(team => {
          const meldPoints = round.meld[team.id] || 0;
          const trickPoints = round.trickPoints[team.id] || 0;
          const roundTotal = meldPoints + trickPoints;
          const isBidWinner = team.id === round.bidWinner;

          // Calculate running score up to this round
          const runningScore = game.rounds
            .slice(0, roundNumber)
            .reduce((sum, r) => {
              const roundPoints = r.meld[team.id] + r.trickPoints[team.id];
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
                {meldPoints}
              </ThemedText>
              <ThemedText type="default" style={styles.tableCell}>
                {trickPoints}
              </ThemedText>
              <ThemedText
                type="subtitle"
                style={[styles.tableCell, styles.boldText]}
              >
                {roundTotal}
              </ThemedText>
              <ThemedText
                type="subtitle"
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
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    marginBottom: Theme.spacing.md,
  },
  roundCardThemed: {
    backgroundColor: Theme.colors.background,
    borderColor: Theme.colors.card.border,
    ...Platform.select({
      ios: {
        ...Theme.shadows.lg,
        shadowColor: Theme.colors.text,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.card.border,
  },
  bidText: {
    color: Theme.colors.textSecondary,
  },
  scoreTable: {
    gap: Theme.spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs / 2,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  teamCell: {
    flex: 2,
    textAlign: 'left',
  },
  bidWinnerText: {
    color: Theme.colors.primary,
  },
  boldText: {
    fontSize: Theme.typography.fontSizes.sm,
    lineHeight:
      Theme.typography.fontSizes.sm * Theme.typography.lineHeights.normal,
  },
});
