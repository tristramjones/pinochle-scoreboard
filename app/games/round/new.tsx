import {useRouter} from 'expo-router';
import React, {useEffect, useState} from 'react';
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
import {ProgressDots} from '../../../components/ProgressDots';
import {ThemedButton} from '../../../components/ThemedButton';
import {ThemedText} from '../../../components/ThemedText';
import {Theme} from '../../../constants/Theme';
import {useGame} from '../../../contexts/GameContext';

type RoundPhase = 'bid' | 'meld' | 'tricks';

export default function NewRoundScreen() {
  const {currentGame, addRound} = useGame();
  const router = useRouter();

  const [phase, setPhase] = useState<RoundPhase>('bid');
  const [bidAmount, setBidAmount] = useState('');
  const [bidTeamId, setBidTeamId] = useState<string | null>(null);
  const [meldPoints, setMeldPoints] = useState<{[key: string]: string}>({});
  const [trickPoints, setTrickPoints] = useState<{[key: string]: string}>({});
  const [moonShotAttempted, setMoonShotAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle navigation after round submission
  useEffect(() => {
    if (isSubmitting) {
      router.back();
    }
  }, [isSubmitting, router]);

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

  const handleSubmitTricks = async () => {
    if (!bidTeamId) {
      Alert.alert('Error', 'Please select a bid winner for the tricks phase');
      return;
    }

    try {
      const roundData = {
        id: `round-${Date.now()}`,
        bidWinner: bidTeamId,
        bid: parseInt(bidAmount),
        meld: Object.fromEntries(
          Object.entries(meldPoints).map(([key, value]) => [
            key,
            parseInt(value) || 0,
          ]),
        ),
        trickPoints: Object.fromEntries(
          Object.entries(trickPoints).map(([key, value]) => [
            key,
            parseInt(value) || 0,
          ]),
        ),
        moonShotAttempted,
        moonShotSuccessful: moonShotAttempted
          ? trickPoints[bidTeamId] === '1'
          : undefined,
      };

      await addRound(roundData);
      setIsSubmitting(true); // This will trigger the navigation effect
    } catch (error) {
      console.error('Error submitting round:', error);
      Alert.alert('Error', 'Failed to submit round. Please try again.');
    }
  };

  const renderBidPhase = () => (
    <View style={styles.phaseContainer}>
      <ThemedText type="title" style={styles.phaseTitle}>
        Bid
      </ThemedText>

      <View style={styles.inputSection}>
        <ThemedText type="heading" style={styles.inputLabel}>
          Bid Amount
        </ThemedText>
        <TextInput
          style={[styles.input, styles.inputThemed]}
          value={bidAmount}
          onChangeText={text => {
            const numericText = text.replace(/[^0-9]/g, '');
            if (numericText.length <= 4) {
              setBidAmount(numericText);
            }
          }}
          keyboardType="number-pad"
          placeholder="250"
          maxLength={4}
          placeholderTextColor={Theme.colors.input.placeholder}
        />
      </View>

      <View style={styles.inputSection}>
        <ThemedText type="heading" style={styles.inputLabel}>
          Bid Winner
        </ThemedText>
        {currentGame.teams.map(team => (
          <TouchableOpacity
            key={team.id}
            style={[
              styles.teamButton,
              bidTeamId === team.id && styles.teamButtonSelected,
            ]}
            onPress={() => setBidTeamId(team.id)}
          >
            <ThemedText
              style={[
                styles.teamButtonText,
                bidTeamId === team.id && styles.teamButtonTextSelected,
              ]}
            >
              {team.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <ThemedButton
        title="Submit Bid"
        onPress={handleSubmitBid}
        variant="primary"
        size="lg"
        style={styles.submitButton}
      />
    </View>
  );

  const renderMeldPhase = () => (
    <View style={styles.phaseContainer}>
      <ThemedText type="title" style={styles.phaseTitle}>
        Meld
      </ThemedText>

      <View style={styles.inputSection}>
        {currentGame.teams.map(team => (
          <View key={team.id} style={styles.teamInput}>
            <ThemedText type="heading" style={styles.inputLabel}>
              {team.name}
            </ThemedText>
            <TextInput
              style={[styles.input, styles.inputThemed]}
              value={meldPoints[team.id] || ''}
              onChangeText={value =>
                setMeldPoints(prev => ({...prev, [team.id]: value}))
              }
              keyboardType="number-pad"
              placeholder="Enter meld points"
              placeholderTextColor={Theme.colors.input.placeholder}
            />
          </View>
        ))}
      </View>

      <ThemedButton
        title="Submit Meld"
        onPress={() => setPhase('tricks')}
        variant="primary"
        size="lg"
        style={styles.submitButton}
      />

      <View style={styles.orSection}>
        <ThemedText type="heading" style={styles.orText}>
          or
        </ThemedText>
      </View>

      <TouchableOpacity
        style={styles.moonShotButton}
        onPress={() => {
          setMoonShotAttempted(true);
          setPhase('tricks');
        }}
      >
        <ThemedText style={styles.moonShotButtonText}>
          Shoot the Moon
        </ThemedText>
      </TouchableOpacity>
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
      }
    };

    if (moonShotAttempted) {
      return (
        <View style={styles.phaseContainer}>
          <ThemedText type="title" style={styles.phaseTitle}>
            Moon Shot
          </ThemedText>

          <View style={styles.inputSection}>
            <ThemedText type="heading" style={styles.inputLabel}>
              Did {currentGame.teams.find(t => t.id === bidTeamId)?.name} make
              the moon shot?
            </ThemedText>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.teamButton,
                  trickPoints[bidTeamId!] === '1' && styles.teamButtonSelected,
                ]}
                onPress={() => setTrickPoints({[bidTeamId!]: '1'})}
              >
                <ThemedText
                  style={[
                    styles.teamButtonText,
                    trickPoints[bidTeamId!] === '1' &&
                      styles.teamButtonTextSelected,
                  ]}
                >
                  Yes
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.teamButton,
                  trickPoints[bidTeamId!] === '0' && styles.teamButtonSelected,
                ]}
                onPress={() => setTrickPoints({[bidTeamId!]: '0'})}
              >
                <ThemedText
                  style={[
                    styles.teamButtonText,
                    trickPoints[bidTeamId!] === '0' &&
                      styles.teamButtonTextSelected,
                  ]}
                >
                  No
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <ThemedButton
            title="Submit Round"
            onPress={handleSubmitTricks}
            variant="primary"
            size="lg"
            style={styles.submitButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.phaseContainer}>
        <ThemedText type="title" style={styles.phaseTitle}>
          Tricks
        </ThemedText>

        <View style={styles.inputSection}>
          {currentGame.teams.map((team, index) => (
            <View key={team.id} style={styles.teamInput}>
              <ThemedText type="heading" style={styles.inputLabel}>
                {team.name}
              </ThemedText>
              <TextInput
                style={[styles.input, styles.inputThemed]}
                value={trickPoints[team.id] || ''}
                onChangeText={value => handleTrickPointsChange(team.id, value)}
                keyboardType="number-pad"
                placeholder="Enter trick points"
                placeholderTextColor={Theme.colors.input.placeholder}
                editable={index === 0} // Only first team can edit
              />
            </View>
          ))}
        </View>

        <ThemedButton
          title="Submit Round"
          onPress={handleSubmitTricks}
          variant="primary"
          size="lg"
          style={styles.submitButton}
        />
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, styles.containerThemed]}
      contentContainerStyle={styles.contentContainer}
    >
      <ProgressDots
        totalSteps={3}
        currentStep={phase === 'bid' ? 1 : phase === 'meld' ? 2 : 3}
      />
      {phase === 'bid' && renderBidPhase()}
      {phase === 'meld' && renderMeldPhase()}
      {phase === 'tricks' && renderTricksPhase()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  containerThemed: {
    backgroundColor: Theme.colors.background,
  } as ViewStyle,
  contentContainer: {
    padding: Theme.spacing.lg,
  } as ViewStyle,
  phaseContainer: {
    flex: 1,
  } as ViewStyle,
  phaseTitle: {
    fontSize: Theme.typography.fontSizes.xxl,
    fontFamily: Theme.typography.fonts.bold,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    color: Theme.colors.primary,
  } as TextStyle,
  inputSection: {
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,
  inputLabel: {
    marginBottom: Theme.spacing.md,
    fontSize: Theme.typography.fontSizes.xl,
    fontFamily: Theme.typography.fonts.regular,
    color: Theme.colors.primary,
  } as TextStyle,
  input: {
    height: Theme.button.sizes.lg.height,
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    fontSize: Theme.typography.fontSizes.xl,
    fontFamily: Theme.typography.fonts.regular,
  } as TextStyle,
  inputThemed: {
    backgroundColor: Theme.colors.input.background,
    borderColor: Theme.colors.input.border,
    color: Theme.colors.input.text,
  } as TextStyle,
  teamButton: {
    backgroundColor: Theme.colors.card.background,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    height: Theme.button.sizes.lg.height,
    paddingHorizontal: Theme.button.sizes.lg.paddingHorizontal,
    marginBottom: Theme.spacing.md,
    justifyContent: 'center',
  } as ViewStyle,
  teamButtonSelected: {
    backgroundColor: Theme.colors.primary,
  } as ViewStyle,
  teamButtonText: {
    fontSize: Theme.button.sizes.lg.fontSize,
    fontFamily: Theme.typography.fonts.regular,
    textAlign: 'center',
    color: Theme.colors.primary,
    lineHeight:
      Theme.button.sizes.lg.fontSize * Theme.button.sizes.lg.lineHeight,
  } as TextStyle,
  teamButtonTextSelected: {
    color: Theme.colors.card.background,
  } as TextStyle,
  submitButton: {
    marginTop: Theme.spacing.xl,
  } as ViewStyle,
  orSection: {
    alignItems: 'center',
    marginVertical: Theme.spacing.md,
  } as ViewStyle,
  orText: {
    color: Theme.colors.accent.burgundy,
    fontSize: Theme.typography.fontSizes.lg,
  } as TextStyle,
  moonShotButton: {
    backgroundColor: Theme.colors.card.background,
    borderWidth: 1,
    borderColor: Theme.colors.accent.burgundy,
    borderRadius: Theme.borderRadius.md,
    height: Theme.button.sizes.lg.height,
    paddingHorizontal: Theme.button.sizes.lg.paddingHorizontal,
    justifyContent: 'center',
  } as ViewStyle,
  moonShotButtonText: {
    fontSize: Theme.button.sizes.lg.fontSize,
    fontFamily: Theme.typography.fonts.regular,
    textAlign: 'center',
    color: Theme.colors.accent.burgundy,
    lineHeight:
      Theme.button.sizes.lg.fontSize * Theme.button.sizes.lg.lineHeight,
  } as TextStyle,
  teamInput: {
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Theme.spacing.md,
  } as ViewStyle,
});
