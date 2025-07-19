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
import {ThemedButton} from '../../../components/ThemedButton';
import {ThemedText} from '../../../components/ThemedText';
import {Theme} from '../../../constants/Theme';
import {useGame} from '../../../contexts/GameContext';
import {useTheme} from '../../../hooks/useTheme';

type RoundPhase = 'bid' | 'meld' | 'tricks';

export default function NewRoundScreen() {
  const theme = useTheme();
  const {currentGame, addRound} = useGame();
  const router = useRouter();

  const [phase, setPhase] = useState<RoundPhase>('bid');
  const [bidAmount, setBidAmount] = useState('');
  const [bidTeamId, setBidTeamId] = useState<string | null>(null);
  const [meldPoints, setMeldPoints] = useState<{[key: string]: string}>({});
  const [trickPoints, setTrickPoints] = useState<{[key: string]: string}>({});
  const [moonShotAttempted, setMoonShotAttempted] = useState(false);

  if (!currentGame) {
    router.replace('/games');
    return null;
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

  const handleSubmitTricks = async () => {
    if (!currentGame || !bidTeamId) return;

    try {
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

        await addRound(roundData);
        router.back();
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

      await addRound(roundData);
      router.back();
    } catch (error) {
      console.error('Error submitting round:', error);
      Alert.alert('Error', 'Failed to submit round. Please try again.');
    }
  };

  const renderBidPhase = () => (
    <View style={styles.phaseContainer}>
      <View style={styles.bidSection}>
        <View style={styles.bidInputRow}>
          <View style={styles.bidAmountContainer}>
            <ThemedText type="label">Bid Amount</ThemedText>
            <TextInput
              style={[styles.bidAmountInput, styles.inputThemed]}
              value={bidAmount}
              onChangeText={text => {
                // Only allow numbers and limit to 4 characters
                const numericText = text.replace(/[^0-9]/g, '');
                if (numericText.length <= 4) {
                  setBidAmount(numericText);
                }
              }}
              keyboardType="number-pad"
              placeholder="250"
              maxLength={4}
              placeholderTextColor={theme.colors.input.placeholder}
            />
          </View>

          <View style={styles.bidWinnerContainer}>
            <ThemedText type="label">Bid Winner</ThemedText>
            <View style={styles.teamButtons}>
              {currentGame.teams.map(team => (
                <TouchableOpacity
                  key={team.id}
                  style={[
                    styles.bidTeamButton,
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
                      styles.buttonText,
                      {
                        color:
                          bidTeamId === team.id
                            ? Theme.colors.button.text
                            : Theme.colors.button.textSecondary,
                      },
                    ]}
                  >
                    {team.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

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
      {!moonShotAttempted && (
        <>
          {currentGame.teams.map(team => (
            <View key={team.id} style={styles.teamInput}>
              <ThemedText type="subtitle" style={styles.meldTeamName}>
                {team.name}
              </ThemedText>
              <View style={styles.pointsInput}>
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
          ))}

          <View style={styles.meldActions}>
            <ThemedButton
              title="Submit Meld"
              onPress={handleSubmitMeld}
              variant="primary"
              size="md"
            />

            <View style={styles.orDivider}>
              <ThemedText type="subtitle" style={styles.orText}>
                or
              </ThemedText>
            </View>

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
                  styles.buttonText,
                  {
                    color: moonShotAttempted
                      ? Theme.colors.button.text
                      : Theme.colors.button.textSecondary,
                  },
                ]}
              >
                Shoot the Moon
              </ThemedText>
            </TouchableOpacity>
          </View>
        </>
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
        {moonShotAttempted ? (
          <View style={styles.moonShotResult}>
            <ThemedText type="subtitle" style={styles.moonShotQuestion}>
              Did {currentGame.teams.find(t => t.id === bidTeamId)?.name} make
              the moon shot?
            </ThemedText>
            <View style={styles.moonShotButtons}>
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
                    styles.buttonText,
                    {
                      color:
                        trickPoints[bidTeamId!] === '1'
                          ? Theme.colors.button.text
                          : Theme.colors.button.textSecondary,
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
                    styles.buttonText,
                    {
                      color:
                        trickPoints[bidTeamId!] === '0'
                          ? Theme.colors.button.text
                          : Theme.colors.button.textSecondary,
                    },
                  ]}
                >
                  No
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
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
      {phase === 'bid' && renderBidPhase()}
      {phase === 'meld' && renderMeldPhase()}
      {phase === 'tricks' && renderTricksPhase()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  containerThemed: {
    backgroundColor: Theme.colors.background,
  } as ViewStyle,
  phaseContainer: {
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  bidSection: {
    gap: Theme.spacing.md,
  } as ViewStyle,
  bidInputRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  } as ViewStyle,
  bidAmountContainer: {
    flex: 1,
  } as ViewStyle,
  bidAmountInput: {
    height: Theme.input.height,
    width: 80,
    borderWidth: 1,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.sm,
    fontSize: Theme.typography.fontSizes.lg,
    textAlign: 'center',
  } as TextStyle,
  bidWinnerContainer: {
    flex: 2,
  } as ViewStyle,
  teamButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
    flexWrap: 'wrap',
  } as ViewStyle,
  teamButton: {
    height: Theme.button.height,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  teamButtonPrimary: {
    backgroundColor: Theme.colors.button.primary,
    borderColor: Theme.colors.button.primary,
  } as ViewStyle,
  teamButtonSecondary: {
    backgroundColor: Theme.colors.button.secondary,
    borderColor: Theme.colors.button.primary,
  } as ViewStyle,
  buttonText: {
    fontSize: Theme.typography.fontSizes.lg,
    textAlign: 'center',
  } as TextStyle,
  input: {
    height: Theme.input.height,
    borderWidth: 1,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.sm,
    fontSize: Theme.typography.fontSizes.lg,
  } as TextStyle,
  inputThemed: {
    backgroundColor: Theme.colors.input.background,
    borderColor: Theme.colors.input.border,
    color: Theme.colors.input.text,
  } as TextStyle,
  teamInput: {
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,
  meldTeamName: {
    fontSize: Theme.typography.fontSizes.lg,
    marginBottom: Theme.spacing.sm,
    color: Theme.colors.text,
  } as TextStyle,
  pointsInput: {
    marginTop: Theme.spacing.xs,
  } as ViewStyle,
  inputGroup: {
    gap: Theme.spacing.xs,
  } as ViewStyle,
  meldActions: {
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
  } as ViewStyle,
  orDivider: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
  } as ViewStyle,
  orText: {
    color: Theme.colors.textSecondary,
  } as TextStyle,
  moonShotResult: {
    gap: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  moonShotQuestion: {
    fontSize: Theme.typography.fontSizes.lg,
    textAlign: 'center',
    color: Theme.colors.text,
    lineHeight:
      Theme.typography.lineHeights.normal * Theme.typography.fontSizes.lg,
  } as TextStyle,
  moonShotButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  bidTeamButton: {
    height: Theme.input.height,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
});
