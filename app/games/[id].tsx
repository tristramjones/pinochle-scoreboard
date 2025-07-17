import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import React, {useCallback, useEffect, useState} from 'react';
import {Platform, ScrollView, StyleSheet, View} from 'react-native';
import {ThemedButton} from '../../components/ThemedButton';
import {ThemedText} from '../../components/ThemedText';
import {useTheme} from '../../hooks/useTheme';
import {Game} from '../../types/game';
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
        {game.rounds.map((round, index) => {
          const bidWinningTeam = game.teams.find(
            team => team.id === round.bidWinner,
          );
          const roundNumber = index + 1;

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
              <ThemedText type="subtitle">Round {roundNumber}</ThemedText>

              <View style={styles.bidInfo}>
                <ThemedText
                  type="label"
                  style={{color: theme.colors.textSecondary}}
                >
                  {bidWinningTeam?.name} bid {round.bid}
                </ThemedText>
                {round.meld[round.bidWinner] +
                  round.trickPoints[round.bidWinner] >=
                round.bid ? (
                  <ThemedText
                    type="label"
                    style={{color: theme.colors.success}}
                  >
                    Made bid
                  </ThemedText>
                ) : (
                  <ThemedText type="label" style={{color: theme.colors.error}}>
                    Went set
                  </ThemedText>
                )}
              </View>

              <View
                style={[
                  styles.pointsTable,
                  {backgroundColor: theme.colors.surface},
                ]}
              >
                <View
                  style={[
                    styles.tableHeader,
                    {backgroundColor: theme.colors.surface},
                  ]}
                >
                  <ThemedText type="label">Team</ThemedText>
                  <ThemedText type="label">Meld</ThemedText>
                  <ThemedText type="label">Tricks</ThemedText>
                  <ThemedText type="label">Total</ThemedText>
                  <ThemedText type="label">Game Score</ThemedText>
                </View>
                {game.teams.map(team => {
                  const meldPoints = round.meld[team.id] || 0;
                  const trickPoints = round.trickPoints[team.id] || 0;
                  const roundTotal = meldPoints + trickPoints;

                  const gameScore = game.rounds
                    .slice(0, index + 1)
                    .reduce((sum, r) => {
                      const meld = r.meld[team.id] || 0;
                      const tricks = r.trickPoints[team.id] || 0;
                      const roundTotal = meld + tricks;

                      if (r.bidWinner === team.id && roundTotal < r.bid) {
                        return sum - r.bid;
                      }

                      return sum + roundTotal;
                    }, 0);

                  return (
                    <View
                      key={team.id}
                      style={[
                        styles.tableRow,
                        {borderTopColor: theme.colors.border},
                      ]}
                    >
                      <ThemedText type="label">{team.name}</ThemedText>
                      <ThemedText type="label">{meldPoints}</ThemedText>
                      <ThemedText type="label">{trickPoints}</ThemedText>
                      <ThemedText type="label">{roundTotal}</ThemedText>
                      <ThemedText
                        type="label"
                        style={[
                          styles.gameScoreCell,
                          {color: theme.colors.primary},
                        ]}
                      >
                        {gameScore}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
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
  bidInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  pointsTable: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  gameScoreCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
});
