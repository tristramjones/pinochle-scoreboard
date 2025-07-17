import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import React, {useCallback, useEffect, useState} from 'react';
import {Platform, ScrollView, StyleSheet, View} from 'react-native';
import {ThemedButton} from '../../components/ThemedButton';
import {ThemedText} from '../../components/ThemedText';
import {useTheme} from '../../hooks/useTheme';
import {Game} from '../../types/game';
import {Round} from '../../types/round';
import {calculateTeamScores} from '../../utils/scoring';
import * as Storage from '../../utils/storage';

export default function GameDetailsScreen() {
  const {id} = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();
  const [game, setGame] = useState<Game | null>(null);

  const loadGame = useCallback(async () => {
    try {
      const history = await Storage.getGameHistory();
      const foundGame = history.find(g => g.id === id);
      setGame(foundGame || null);

      if (foundGame) {
        const title = `${foundGame.teams[0].name} vs ${foundGame.teams[1].name}`;
        navigation.setOptions({
          title,
          headerTitle: title,
        });
      }
    } catch (error) {
      console.error('Error loading game:', error);
    }
  }, [id, navigation]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (!game) {
    return (
      <View
        style={[styles.container, {backgroundColor: theme.colors.background}]}
      >
        <ThemedText type="heading">Game not found</ThemedText>
        <ThemedButton
          title="Back to Games"
          onPress={() => router.back()}
          variant="primary"
        />
      </View>
    );
  }

  const scores = calculateTeamScores(game);
  const winner = game.teams.reduce((prev, curr) =>
    scores[curr.id] > scores[prev.id] ? curr : prev,
  );

  const renderRoundCard = (round: Round, index: number) => {
    const roundNumber = index + 1;
    const bidWinningTeam = game!.teams.find(
      team => team.id === round.bidWinner,
    );
    const madeBid =
      round.meld[round.bidWinner] + round.trickPoints[round.bidWinner] >=
      round.bid;

    return (
      <View
        key={round.id}
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
          {game!.teams.map(team => {
            const meldPoints = round.meld[team.id] || 0;
            const trickPoints = round.trickPoints[team.id] || 0;
            const roundTotal = meldPoints + trickPoints;
            const isBidWinner = team.id === round.bidWinner;

            // Calculate running score up to this round
            const runningScore = game!.rounds
              .slice(0, index + 1)
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
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
    >
      <View style={styles.header}>
        <ThemedText
          type="label"
          style={[styles.date, {color: theme.colors.textSecondary}]}
        >
          {formatDate(game.timestamp)}
        </ThemedText>
        <View style={styles.teams}>
          {game.teams.map(team => (
            <View key={team.id} style={styles.teamScore}>
              <ThemedText
                type="subtitle"
                style={[
                  styles.teamName,
                  team.id === winner.id && {color: theme.colors.primary},
                ]}
              >
                {team.name}
                {team.id === winner.id && ' 🏆'}
              </ThemedText>
              <ThemedText
                type="score"
                style={[
                  styles.score,
                  team.id === winner.id && {color: theme.colors.primary},
                ]}
              >
                {scores[team.id]} points
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.rounds}>
        <ThemedText type="heading">Rounds</ThemedText>
        {game.rounds.map((round, index) => renderRoundCard(round, index))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  date: {
    marginBottom: 8,
  },
  teams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
  },
  teamScore: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    marginBottom: 4,
  },
  score: {
    marginBottom: 4,
  },
  rounds: {
    gap: 16,
  },
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
  totalValue: {
    fontWeight: 'bold',
  },
});
