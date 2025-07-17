import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {ThemedButton} from '../../components/ThemedButton';
import {useTheme} from '../../hooks/useTheme';
import {Game} from '../../types/game';
import {calculateTeamScores} from '../../utils/scoring';
import * as Storage from '../../utils/storage';

export default function GameDetailsScreen() {
  const {id} = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const {colors} = useTheme();
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
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <Text style={[styles.title, {color: colors.text}]}>Game not found</Text>
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
      style={[styles.container, {backgroundColor: colors.background}]}
    >
      <View style={styles.header}>
        <Text style={[styles.date, {color: colors.textSecondary}]}>
          {formatDate(game.timestamp)}
        </Text>
        <View style={styles.teams}>
          {game.teams.map(team => (
            <View key={team.id} style={styles.teamScore}>
              <Text
                style={[
                  styles.teamName,
                  {color: colors.text},
                  team.id === winner.id && {color: colors.primary},
                ]}
              >
                {team.name}
                {team.id === winner.id && ' 🏆'}
              </Text>
              <Text
                style={[
                  styles.score,
                  {color: colors.text},
                  team.id === winner.id && {color: colors.primary},
                ]}
              >
                {scores[team.id]} points
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.rounds}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Rounds</Text>
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
                  backgroundColor: colors.card.background,
                  borderColor: colors.card.border,
                  shadowColor: colors.card.shadow,
                },
              ]}
            >
              <Text style={[styles.roundTitle, {color: colors.text}]}>
                Round {roundNumber}
              </Text>

              <View style={styles.bidInfo}>
                <Text style={[styles.bidText, {color: colors.textSecondary}]}>
                  {bidWinningTeam?.name} bid {round.bid}
                </Text>
                {round.meld[round.bidWinner] +
                  round.trickPoints[round.bidWinner] >=
                round.bid ? (
                  <Text style={[styles.madeBid, {color: colors.success}]}>
                    Made bid
                  </Text>
                ) : (
                  <Text style={[styles.setBid, {color: colors.error}]}>
                    Went set
                  </Text>
                )}
              </View>

              <View
                style={[styles.pointsTable, {backgroundColor: colors.surface}]}
              >
                <View
                  style={[
                    styles.tableHeader,
                    {backgroundColor: colors.surface},
                  ]}
                >
                  <Text style={[styles.tableCell, {color: colors.text}]}>
                    Team
                  </Text>
                  <Text style={[styles.tableCell, {color: colors.text}]}>
                    Meld
                  </Text>
                  <Text style={[styles.tableCell, {color: colors.text}]}>
                    Tricks
                  </Text>
                  <Text style={[styles.tableCell, {color: colors.text}]}>
                    Total
                  </Text>
                  <Text style={[styles.tableCell, {color: colors.text}]}>
                    Game Score
                  </Text>
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
                      style={[styles.tableRow, {borderTopColor: colors.border}]}
                    >
                      <Text style={[styles.tableCell, {color: colors.text}]}>
                        {team.name}
                      </Text>
                      <Text style={[styles.tableCell, {color: colors.text}]}>
                        {meldPoints}
                      </Text>
                      <Text style={[styles.tableCell, {color: colors.text}]}>
                        {trickPoints}
                      </Text>
                      <Text style={[styles.tableCell, {color: colors.text}]}>
                        {roundTotal}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.gameScoreCell,
                          {color: colors.primary},
                        ]}
                      >
                        {gameScore}
                      </Text>
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
    fontSize: 14,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  score: {
    fontSize: 20,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  rounds: {
    flex: 1,
  },
  roundCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roundTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bidInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bidText: {
    fontSize: 16,
  },
  madeBid: {
    fontSize: 14,
    fontWeight: '600',
  },
  setBid: {
    fontSize: 14,
    fontWeight: '600',
  },
  pointsTable: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  gameScoreCell: {
    fontWeight: '600',
  },
});
