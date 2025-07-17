import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {RoundCard} from '../../components/RoundCard';
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
        {game.rounds.map((round, index) => (
          <RoundCard
            key={round.id}
            round={round}
            game={game}
            roundNumber={index + 1}
          />
        ))}
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
});
