import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import {Game} from '../types/game';
import {Round} from '../types/round';
import {ThemedText} from './ThemedText';

type RoundCardProps = {
  round: Round;
  game: Game;
  roundNumber: number;
};

export function RoundCard({round, game, roundNumber}: RoundCardProps) {
  const theme = useTheme();
  const bidWinningTeam = game.teams.find(team => team.id === round.bidWinner);

  return (
    <View
      style={[
        styles.roundCard,
        {
          backgroundColor: theme.colors.card.background,
          borderColor: theme.colors.card.border,
          shadowColor: theme.colors.card.shadow,
        },
      ]}
    >
      {/* Card Header */}
      <View style={styles.roundHeader}>
        <ThemedText type="subtitle">Round {roundNumber}</ThemedText>
        <ThemedText type="label" style={{color: theme.colors.textSecondary}}>
          {bidWinningTeam?.name} bid {round.bid}
        </ThemedText>
      </View>

      {/* Score Table */}
      <View style={styles.scoreTable}>
        {/* Table Header */}
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

        {/* Team Rows */}
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
                  isBidWinner && {color: theme.colors.primary},
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
                style={[styles.tableCell, {fontSize: 16, lineHeight: 24}]}
              >
                {roundTotal}
              </ThemedText>
              <ThemedText
                type="subtitle"
                style={[styles.tableCell, {fontSize: 16, lineHeight: 24}]}
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8D5C0',
  },
  scoreTable: {
    gap: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  teamCell: {
    flex: 2,
    textAlign: 'left',
  },
});
