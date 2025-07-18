import {useRouter} from 'expo-router';
import React, {useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {RoundCard} from '../../components/RoundCard';
import {ThemedButton} from '../../components/ThemedButton';
import {ThemedText} from '../../components/ThemedText';
import {ThemedView} from '../../components/ThemedView';
import VictoryScreen from '../../components/VictoryScreen';
import {Theme} from '../../constants/Theme';
import {useGame} from '../../contexts/GameContext';
import {useTheme} from '../../hooks/useTheme';
import {calculateTeamScore} from '../../utils/scoring';

type RoundPhase = 'bid' | 'meld' | 'tricks';

export default function CurrentGameScreen() {
  const theme = useTheme();
  const {currentGame, addRound, endGame} = useGame();

  const router = useRouter();
  const [phase, setPhase] = useState<RoundPhase>('bid');
  const [bidAmount, setBidAmount] = useState('');
  const [bidTeamId, setBidTeamId] = useState<string | null>(null);
  const [meldPoints, setMeldPoints] = useState<{[key: string]: string}>({});
  const [trickPoints, setTrickPoints] = useState<{[key: string]: string}>({});
  const [winningTeam, setWinningTeam] = useState<{
    name: string;
    score: number;
  } | null>(null);
  const [moonShotAttempted, setMoonShotAttempted] = useState(false);

  if (!currentGame) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">No Current Game</ThemedText>
        <ThemedButton title="Back to Games" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  // Check if game should have ended
  const shouldHaveEnded = currentGame.teams.some(
    team => calculateTeamScore(currentGame, team.id) >= 1500,
  );

  if (shouldHaveEnded) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.errorText}>
          This game has a winner but didn&apos;t end properly.
        </ThemedText>
        <View style={styles.buttonContainer}>
          <ThemedButton
            title="Force End Game"
            onPress={async () => {
              try {
                const winningTeam = currentGame.teams.reduce((prev, curr) => {
                  const prevScore = calculateTeamScore(currentGame, prev.id);
                  const currScore = calculateTeamScore(currentGame, curr.id);
                  return currScore > prevScore ? curr : prev;
                });
                const finalScore = calculateTeamScore(
                  currentGame,
                  winningTeam.id,
                );
                setWinningTeam({
                  name: winningTeam.name,
                  score: finalScore,
                });
                await endGame(currentGame);
                router.replace('/games');
              } catch (error) {
                console.error('Error forcing game end:', error);
                Alert.alert('Error', 'Failed to end game. Please try again.');
              }
            }}
            variant="primary"
          />
          <ThemedButton title="Back to Games" onPress={() => router.back()} />
        </View>
      </ThemedView>
    );
  }

  const handleSubmitBid = () => {
    if (!bidTeamId || !bidAmount) {
      Alert.alert('Error', 'Please select a bid winner and enter bid amount');
      return;
    }

    const bid = parseInt(bidAmount);
    if (isNaN(bid) || bid <= 0) {
      Alert.alert('Error', 'Please enter a valid bid amount');
      return;
    }

    setPhase('meld');
  };

  const handleSubmitMeld = () => {
    const meldValues: {[key: string]: number} = {};

    for (const team of currentGame.teams) {
      const meld = parseInt(meldPoints[team.id] || '0');
      if (isNaN(meld) || meld < 0) {
        Alert.alert('Error', 'Please enter valid meld points for all teams');
        return;
      }
      meldValues[team.id] = meld;
    }

    setPhase('tricks');
  };

  const handleSubmitTricks = () => {
    if (!currentGame || !bidTeamId) return;

    if (moonShotAttempted) {
      const roundData = {
        id: `round-${Date.now()}`,
        bidWinner: bidTeamId,
        bid: parseInt(bidAmount),
        meld: {},
        trickPoints: {},
        moonShotAttempted: true,
        moonShotSuccessful: trickPoints[bidTeamId] === '1',
      };

      // Calculate the new score after moon shot
      const bidTeam = currentGame.teams.find(team => team.id === bidTeamId);
      if (bidTeam) {
        const currentScore = calculateTeamScore(currentGame, bidTeamId);
        const moonShotPoints = trickPoints[bidTeamId] === '1' ? 1500 : -1500;
        const newScore = currentScore + moonShotPoints;

        // Check if this would win the game
        if (newScore >= 1500) {
          setWinningTeam({
            name: bidTeam.name,
            score: newScore,
          });
        }
      }

      addRound(roundData);
      return;
    }

    // Regular round handling
    const meldValues: {[key: string]: number} = {};
    const trickValues: {[key: string]: number} = {};

    for (const team of currentGame.teams) {
      const meld = parseInt(meldPoints[team.id] || '0');
      const tricks = parseInt(trickPoints[team.id] || '0');
      if (isNaN(meld) || isNaN(tricks) || meld < 0 || tricks < 0) {
        Alert.alert('Error', 'Please enter valid points for all teams');
        return;
      }
      meldValues[team.id] = meld;
      trickValues[team.id] = tricks;
    }

    const roundData = {
      id: `round-${Date.now()}`,
      bidWinner: bidTeamId,
      bid: parseInt(bidAmount),
      meld: meldValues,
      trickPoints: trickValues,
      moonShotAttempted: false,
    };

    // Check if this round would win the game
    const bidTeam = currentGame.teams.find(team => team.id === bidTeamId);
    if (bidTeam) {
      const currentScore = calculateTeamScore(currentGame, bidTeamId);
      const roundTotal = meldValues[bidTeamId] + trickValues[bidTeamId];
      const newScore =
        currentScore +
        (roundTotal >= parseInt(bidAmount) ? roundTotal : -parseInt(bidAmount));

      if (newScore >= 1500) {
        setWinningTeam({
          name: bidTeam.name,
          score: newScore,
        });
      }
    }

    addRound(roundData);
  };

  const calculateRequiredTricks = () => {
    if (!bidTeamId || !bidAmount) return null;

    const bid = parseInt(bidAmount);
    const meld = parseInt(meldPoints[bidTeamId] || '0');
    if (isNaN(bid) || isNaN(meld)) return null;

    const requiredTricks = Math.max(0, bid - meld);
    return requiredTricks;
  };

  const renderBidPhase = () => (
    <View style={styles.phaseContainer}>
      <View style={styles.bidSection}>
        <ThemedText type="label">Bid Winner</ThemedText>
        <View style={styles.teamButtons}>
          {currentGame.teams.map(team => (
            <TouchableOpacity
              key={team.id}
              style={[
                styles.teamButton,
                {
                  backgroundColor:
                    bidTeamId === team.id
                      ? styles.teamButtonPrimary.backgroundColor
                      : styles.teamButtonSecondary.backgroundColor,
                  borderColor:
                    bidTeamId === team.id
                      ? styles.teamButtonPrimary.borderColor
                      : styles.teamButtonSecondary.borderColor,
                },
              ]}
              onPress={() => setBidTeamId(team.id)}
            >
              <ThemedText
                style={[
                  styles.teamButtonTextPrimary,
                  {
                    color:
                      bidTeamId === team.id
                        ? styles.teamButtonTextPrimary.color
                        : styles.teamButtonTextSecondary.color,
                  },
                ]}
              >
                {team.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <ThemedText type="label">Bid Amount</ThemedText>
        <TextInput
          style={[styles.input, styles.inputThemed]}
          value={bidAmount}
          onChangeText={setBidAmount}
          keyboardType="number-pad"
          placeholder="Enter bid amount"
          placeholderTextColor={theme.colors.input.placeholder}
        />

        <ThemedButton
          title="Submit Bid"
          onPress={handleSubmitBid}
          variant="primary"
          size="md"
        />
      </View>
    </View>
  );

  const renderMeldPhase = () => (
    <View style={styles.phaseContainer}>
      <View style={styles.teamButtons}>
        <TouchableOpacity
          style={[
            styles.teamButton,
            {
              backgroundColor: moonShotAttempted
                ? styles.teamButtonPrimary.backgroundColor
                : styles.teamButtonSecondary.backgroundColor,
              borderColor: moonShotAttempted
                ? styles.teamButtonPrimary.borderColor
                : styles.teamButtonSecondary.borderColor,
            },
          ]}
          onPress={() => {
            setMoonShotAttempted(true);
            setPhase('tricks');
          }}
        >
          <ThemedText
            style={[
              styles.teamButtonTextPrimary,
              {
                color: moonShotAttempted
                  ? styles.teamButtonTextPrimary.color
                  : styles.teamButtonTextSecondary.color,
              },
            ]}
          >
            Shoot the Moon
          </ThemedText>
        </TouchableOpacity>
      </View>

      {!moonShotAttempted && (
        <>
          {currentGame.teams.map(team => (
            <View key={team.id} style={styles.teamInput}>
              <ThemedText type="label">{team.name}</ThemedText>
              <View style={styles.pointsInput}>
                <View style={styles.inputGroup}>
                  <ThemedText type="label">Meld Points</ThemedText>
                  <TextInput
                    style={[styles.input, styles.inputThemed]}
                    value={meldPoints[team.id] || ''}
                    onChangeText={value =>
                      setMeldPoints(prev => ({...prev, [team.id]: value}))
                    }
                    keyboardType="number-pad"
                    placeholder="Enter meld points"
                    placeholderTextColor={theme.colors.input.placeholder}
                  />
                </View>
              </View>
            </View>
          ))}
        </>
      )}

      {!moonShotAttempted && (
        <ThemedButton
          title="Submit Meld"
          onPress={handleSubmitMeld}
          variant="primary"
          size="md"
        />
      )}
    </View>
  );

  const renderTricksPhase = () => {
    const handleTrickPointsChange = (teamId: string, value: string) => {
      const points = parseInt(value) || 0;
      const otherTeam = currentGame.teams.find(t => t.id !== teamId);

      if (otherTeam) {
        setTrickPoints({
          [teamId]: value,
          [otherTeam.id]: points <= 250 ? String(250 - points) : '0',
        });
      } else {
        setTrickPoints(prev => ({...prev, [teamId]: value}));
      }
    };

    return (
      <View style={styles.phaseContainer}>
        <ThemedText type="heading">
          {moonShotAttempted ? 'Moon Shot Result' : 'Phase 3: Tricks'}
        </ThemedText>

        {moonShotAttempted ? (
          <>
            <ThemedText type="label">
              Did {currentGame.teams.find(t => t.id === bidTeamId)?.name} make
              the moon shot?
            </ThemedText>
            <View style={styles.teamButtons}>
              <TouchableOpacity
                style={[
                  styles.teamButton,
                  {
                    backgroundColor:
                      trickPoints[bidTeamId!] === '1'
                        ? styles.teamButtonPrimary.backgroundColor
                        : styles.teamButtonSecondary.backgroundColor,
                    borderColor:
                      trickPoints[bidTeamId!] === '1'
                        ? styles.teamButtonPrimary.borderColor
                        : styles.teamButtonSecondary.borderColor,
                  },
                ]}
                onPress={() => setTrickPoints({[bidTeamId!]: '1'})}
              >
                <ThemedText
                  style={[
                    styles.teamButtonTextPrimary,
                    {
                      color:
                        trickPoints[bidTeamId!] === '1'
                          ? styles.teamButtonTextPrimary.color
                          : styles.teamButtonTextSecondary.color,
                    },
                  ]}
                >
                  Yes
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.teamButton,
                  {
                    backgroundColor:
                      trickPoints[bidTeamId!] === '0'
                        ? styles.teamButtonPrimary.backgroundColor
                        : styles.teamButtonSecondary.backgroundColor,
                    borderColor:
                      trickPoints[bidTeamId!] === '0'
                        ? styles.teamButtonPrimary.borderColor
                        : styles.teamButtonSecondary.borderColor,
                  },
                ]}
                onPress={() => setTrickPoints({[bidTeamId!]: '0'})}
              >
                <ThemedText
                  style={[
                    styles.teamButtonTextPrimary,
                    {
                      color:
                        trickPoints[bidTeamId!] === '0'
                          ? styles.teamButtonTextPrimary.color
                          : styles.teamButtonTextSecondary.color,
                    },
                  ]}
                >
                  No
                </ThemedText>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {currentGame.teams.map((team, index) => (
              <View key={team.id} style={styles.teamInput}>
                <ThemedText type="label">{team.name}</ThemedText>
                <View style={styles.pointsInput}>
                  <View style={styles.inputGroup}>
                    <ThemedText type="label">Trick Points</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={trickPoints[team.id] || ''}
                      onChangeText={value =>
                        handleTrickPointsChange(team.id, value)
                      }
                      keyboardType="number-pad"
                      placeholder="Enter trick points"
                      editable={index === 0} // Only first team can edit
                    />
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        <ThemedButton
          title="Submit Round"
          onPress={handleSubmitTricks}
          variant="primary"
          size="md"
        />
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, styles.containerThemed]}>
      <View style={styles.scoreHeader}>
        <ThemedText type="title">Current Game</ThemedText>
        {currentGame.teams.map(team => (
          <View key={team.id} style={styles.teamScore}>
            <ThemedText type="label">{team.name}</ThemedText>
            <ThemedText type="label">
              Score: {calculateTeamScore(currentGame, team.id)}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.roundInput}>
        <ThemedText type="heading">New Round</ThemedText>
        {phase === 'bid' && renderBidPhase()}
        {phase === 'meld' && renderMeldPhase()}
        {phase === 'tricks' && renderTricksPhase()}
      </View>

      {currentGame?.rounds?.length > 0 && (
        <View>
          <ThemedText type="heading" style={styles.sectionTitle}>
            Previous Rounds
          </ThemedText>
          <View style={styles.roundsContainer}>
            {currentGame.rounds.map((round, index) => (
              <RoundCard
                key={round.id}
                round={round}
                game={currentGame}
                roundNumber={index + 1}
              />
            ))}
          </View>
        </View>
      )}
      {winningTeam && <VictoryScreen winningTeam={winningTeam} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.md,
  } as ViewStyle,
  containerThemed: {
    backgroundColor: Theme.colors.background,
  } as ViewStyle,
  title: {
    fontSize: Theme.typography.fontSizes.xl,
    fontWeight: Theme.typography.fontWeights.bold,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  } as TextStyle,
  scoreHeader: {
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  teamScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  } as ViewStyle,
  roundInput: {
    flex: 1,
  } as ViewStyle,
  sectionTitle: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: Theme.typography.fontWeights.semibold,
    marginBottom: Theme.spacing.md,
  } as TextStyle,
  phaseContainer: {
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  phaseTitle: {
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: Theme.typography.fontWeights.semibold,
    marginBottom: Theme.spacing.md,
  } as TextStyle,
  bidSection: {
    gap: Theme.spacing.md,
  } as ViewStyle,
  teamButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
    flexWrap: 'wrap',
  } as ViewStyle,
  teamButton: {
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
  } as ViewStyle,
  teamButtonPrimary: {
    backgroundColor: Theme.colors.button.primary,
    borderColor: Theme.colors.button.primary,
  } as ViewStyle,
  teamButtonSecondary: {
    backgroundColor: Theme.colors.button.secondary,
    borderColor: Theme.colors.button.primary,
  } as ViewStyle,
  teamButtonTextPrimary: {
    color: Theme.colors.button.text,
    fontSize: Theme.typography.fontSizes.sm,
    fontWeight: Theme.typography.fontWeights.medium,
  } as TextStyle,
  teamButtonTextSecondary: {
    color: Theme.colors.button.textSecondary,
    fontSize: Theme.typography.fontSizes.sm,
    fontWeight: Theme.typography.fontWeights.medium,
  } as TextStyle,
  label: {
    fontSize: Theme.typography.fontSizes.sm,
    marginBottom: Theme.spacing.xs,
  } as TextStyle,
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.sm,
    fontSize: Theme.typography.fontSizes.sm,
  } as TextStyle,
  inputThemed: {
    backgroundColor: Theme.colors.input.background,
    borderColor: Theme.colors.input.border,
    color: Theme.colors.input.text,
  } as TextStyle,
  submitButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
  } as ViewStyle,
  buttonText: {
    color: Theme.colors.button.text,
    fontSize: Theme.typography.fontSizes.sm,
    fontWeight: Theme.typography.fontWeights.semibold,
  } as TextStyle,
  teamInput: {
    marginBottom: Theme.spacing.md,
  } as ViewStyle,
  teamName: {
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: Theme.typography.fontWeights.semibold,
    marginBottom: Theme.spacing.xs,
  } as TextStyle,
  pointsInput: {
    marginTop: Theme.spacing.xs,
  } as ViewStyle,
  inputGroup: {
    gap: Theme.spacing.xs,
  } as ViewStyle,
  requiredTricksInfo: {
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  } as ViewStyle,
  infoText: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.textSecondary,
  } as TextStyle,
  score: {
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: Theme.typography.fontWeights.medium,
  } as TextStyle,
  button: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    marginTop: Theme.spacing.md,
  } as ViewStyle,
  roundsContainer: {
    gap: Theme.spacing.sm,
  } as ViewStyle,
  errorText: {
    marginVertical: Theme.spacing.md,
    textAlign: 'center',
  } as TextStyle,
  buttonContainer: {
    gap: Theme.spacing.md,
  } as ViewStyle,
});
