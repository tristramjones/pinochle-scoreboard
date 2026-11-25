import {KeyboardScrollView} from '../../../components/KeyboardScrollView';
import {useRouter} from 'expo-router';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Keyboard,
  StyleSheet,
  TextInput,
  TextStyle,
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
  const {currentGame, addRound, isLoading} = useGame();
  const router = useRouter();

  const [phase, setPhase] = useState<RoundPhase>('bid');
  const [bidAmount, setBidAmount] = useState('');
  const [bidTeamId, setBidTeamId] = useState<string | null>(null);
  const [meldPoints, setMeldPoints] = useState<{[key: string]: string}>({});
  const [trickPoints, setTrickPoints] = useState<{[key: string]: string}>({});
  const [moonShotAttempted, setMoonShotAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submissionPending = useRef(false);

  // Handle navigation when no current game
  useEffect(() => {
    if (!currentGame && !isLoading && !submissionPending.current) {
      router.replace('/games');
    }
  }, [currentGame, isLoading, router]);

  if (!currentGame) {
    return null;
  }

  const handleSubmitBid = () => {
    if (!bidTeamId || !bidAmount) {
      Alert.alert('Error', 'Please select a bid winner and enter bid amount');
      return;
    }

    const bid = parseInt(bidAmount);
    if (!Number.isInteger(bid) || bid <= 0 || bid > 1500) {
      Alert.alert('Error', 'Please enter a bid from 1 to 1500');
      return;
    }

    Keyboard.dismiss();
    setPhase('meld');
  };

  const handleSubmitMeld = () => {
    if (!bidTeamId) {
      Alert.alert('Error', 'No bid winner selected');
      return;
    }

    // Convert meld points to numbers
    const bidTeamMeld = Number(meldPoints[bidTeamId] || '0');
    const otherTeamId = currentGame.teams.find(t => t.id !== bidTeamId)?.id;
    if (!otherTeamId) {
      Alert.alert('Error', 'Could not find other team');
      return;
    }
    const otherTeamMeld = Number(meldPoints[otherTeamId] || '0');

    if (
      currentGame.teams.some(
        team => !/^\d*$/.test(meldPoints[team.id] || ''),
      ) ||
      ![bidTeamMeld, otherTeamMeld].every(
        value => Number.isSafeInteger(value) && value >= 0,
      )
    ) {
      Alert.alert('Error', 'Please enter non-negative whole numbers for meld');
      return;
    }
    // Record actual tricks even when the bid cannot be made. Meld requires a trick.
    Keyboard.dismiss();
    setPhase('tricks');
  };

  const handleSubmitTricks = async () => {
    if (!bidTeamId) {
      Alert.alert('Error', 'Please select a bid winner for the tricks phase');
      return;
    }

    if (submissionPending.current) return;
    if (moonShotAttempted && !['0', '1'].includes(trickPoints[bidTeamId])) {
      Alert.alert('Error', 'Please select Yes or No for the moon shot');
      return;
    }
    if (!moonShotAttempted) {
      const values = currentGame.teams.map(team =>
        Number(trickPoints[team.id]),
      );
      if (
        currentGame.teams.some(
          team => !/^\d+$/.test(trickPoints[team.id] || ''),
        ) ||
        !values.every(
          value => Number.isSafeInteger(value) && value >= 0 && value <= 250,
        ) ||
        values.reduce((sum, value) => sum + value, 0) !== 250
      ) {
        Alert.alert(
          'Error',
          'Trick points must be whole numbers from 0 to 250 and total 250',
        );
        return;
      }
    }
    Keyboard.dismiss();
    submissionPending.current = true;
    setIsSubmitting(true);
    try {
      const otherTeamId = currentGame.teams.find(t => t.id !== bidTeamId)?.id;
      if (!otherTeamId) {
        throw new Error('Could not find other team ID');
      }

      const finalTrickPoints = moonShotAttempted
        ? {
            [bidTeamId]: trickPoints[bidTeamId] === '1' ? 1500 : -1500,
            [otherTeamId]: 0,
          }
        : Object.fromEntries(
            Object.entries(trickPoints).map(([key, value]) => [
              key,
              parseInt(value) || 0,
            ]),
          );

      const roundData = {
        id: `round-${Date.now()}`,
        timestamp: Date.now(),
        bidWinner: bidTeamId,
        bid: parseInt(bidAmount),
        meld: moonShotAttempted
          ? {[bidTeamId]: 0, [otherTeamId]: 0}
          : Object.fromEntries(
              Object.entries(meldPoints).map(([key, value]) => [
                key,
                parseInt(value) || 0,
              ]),
            ),
        trickPoints: finalTrickPoints,
        moonShotAttempted,
        moonShotSuccessful: moonShotAttempted
          ? trickPoints[bidTeamId] === '1'
          : undefined,
      };

      await addRound(roundData);
    } catch (error) {
      console.error('Error submitting round:', error);
      Alert.alert('Error', 'Failed to submit round. Please try again.');
    } finally {
      submissionPending.current = false;
      setIsSubmitting(false);
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
          returnKeyType="done"
          keyboardAppearance="dark"
          onSubmitEditing={Keyboard.dismiss}
          style={[styles.input, styles.inputThemed]}
          value={bidAmount}
          onChangeText={text => {
            const numericText = text.replace(/[^0-9]/g, '');
            if (numericText.length <= 4 && Number(numericText) <= 1500) {
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
        <ThemedText style={styles.inputLabel}>Who won the bid?</ThemedText>
        <View style={styles.buttonGroup}>
          {currentGame.teams.map((team, index) => (
            <ThemedButton
              key={team.id}
              title={team.name}
              onPress={() => setBidTeamId(team.id)}
              variant="secondary"
              size="lg"
              style={[
                styles.fullWidthButton,
                bidTeamId === team.id && styles.selectedButton,
              ]}
              textStyle={bidTeamId === team.id && styles.selectedButtonText}
            />
          ))}
        </View>
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
      <ThemedText type="subtitle" style={styles.phaseSubtitle}>
        {`${
          currentGame.teams.find(t => t.id === bidTeamId)?.name
        } bid ${bidAmount}`}
      </ThemedText>

      <View style={styles.inputSection}>
        {currentGame.teams.map(team => (
          <View key={team.id} style={styles.teamInput}>
            <ThemedText type="heading" style={styles.inputLabel}>
              {team.name}
            </ThemedText>
            <TextInput
              returnKeyType="done"
              keyboardAppearance="dark"
              onSubmitEditing={Keyboard.dismiss}
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
        onPress={handleSubmitMeld}
        variant="primary"
        size="lg"
        style={styles.submitButton}
      />

      <View style={styles.orSection}>
        <ThemedText type="heading" style={styles.orText}>
          or
        </ThemedText>
      </View>

      <ThemedButton
        title="Shoot the Moon"
        onPress={() => {
          setMoonShotAttempted(true);
          Keyboard.dismiss();
          setPhase('tricks');
        }}
        variant="secondary"
        size="lg"
      />
    </View>
  );

  const renderTricksPhase = () => {
    const handleTrickPointsChange = (teamId: string, value: string) => {
      if (!/^\d*$/.test(value) || Number(value) > 250) return;
      const points = Number(value);
      const otherTeam = currentGame.teams.find(t => t.id !== teamId);

      if (otherTeam) {
        setTrickPoints({
          [teamId]: value,
          [otherTeam.id]: value === '' ? '' : String(250 - points),
        });
      }
    };

    if (moonShotAttempted) {
      return (
        <View style={styles.phaseContainer}>
          <ThemedText type="title" style={styles.phaseTitle}>
            Moon Shot
          </ThemedText>
          <ThemedText type="subtitle" style={styles.phaseSubtitle}>
            {`${
              currentGame.teams.find(t => t.id === bidTeamId)?.name
            } bid ${bidAmount}`}
          </ThemedText>

          <View style={styles.inputSection}>
            <ThemedText type="heading" style={styles.inputLabel}>
              Did {currentGame.teams.find(t => t.id === bidTeamId)?.name} make
              the moon shot?
            </ThemedText>
            <View style={styles.buttonGroup}>
              <ThemedButton
                title="Yes"
                onPress={() => {
                  const otherTeamId = currentGame.teams.find(
                    t => t.id !== bidTeamId,
                  )?.id;
                  setTrickPoints({
                    [bidTeamId!]: '1',
                    [otherTeamId!]: '0',
                  });
                }}
                variant="secondary"
                size="lg"
                style={[
                  styles.fullWidthButton,
                  trickPoints[bidTeamId!] === '1' && styles.selectedButton,
                ]}
                textStyle={
                  trickPoints[bidTeamId!] === '1' && styles.selectedButtonText
                }
              />
              <ThemedButton
                title="No"
                onPress={() => {
                  const otherTeamId = currentGame.teams.find(
                    t => t.id !== bidTeamId,
                  )?.id;
                  setTrickPoints({
                    [bidTeamId!]: '0',
                    [otherTeamId!]: '0',
                  });
                }}
                variant="secondary"
                size="lg"
                style={[
                  styles.fullWidthButton,
                  trickPoints[bidTeamId!] === '0' && styles.selectedButton,
                ]}
                textStyle={
                  trickPoints[bidTeamId!] === '0' && styles.selectedButtonText
                }
              />
            </View>
          </View>

          <ThemedButton
            title="Submit Round"
            disabled={isSubmitting}
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
        <ThemedText type="subtitle" style={styles.phaseSubtitle}>
          {(() => {
            const bidTeam = currentGame.teams.find(t => t.id === bidTeamId);
            const bidTeamMeld = parseInt(meldPoints[bidTeamId!] || '0');
            const tricksNeeded = Math.max(0, parseInt(bidAmount) - bidTeamMeld);
            return tricksNeeded > 250
              ? `${bidTeam?.name} cannot make the bid. Record tricks to score the round.`
              : `${bidTeam?.name} needs ${tricksNeeded} trick points to make bid of ${bidAmount}. Meld requires winning a trick.`;
          })()}
        </ThemedText>

        <View style={styles.inputSection}>
          {currentGame.teams.map((team, index) => (
            <View key={team.id} style={styles.teamInput}>
              <ThemedText type="heading" style={styles.inputLabel}>
                {team.name}
              </ThemedText>
              <TextInput
                returnKeyType="done"
                keyboardAppearance="dark"
                onSubmitEditing={Keyboard.dismiss}
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
          disabled={isSubmitting}
          onPress={handleSubmitTricks}
          variant="primary"
          size="lg"
          style={styles.submitButton}
        />
      </View>
    );
  };

  return (
    <KeyboardScrollView
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
    </KeyboardScrollView>
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
    letterSpacing: 0.5,
    fontSize: Theme.typography.fontSizes.xxl,
    fontFamily: Theme.typography.fonts.bold,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
    color: Theme.colors.primary,
  } as TextStyle,
  phaseSubtitle: {
    fontSize: Theme.typography.fontSizes.lg,
    fontFamily: Theme.typography.fonts.regular,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    color: Theme.colors.textSecondary,
  } as TextStyle,
  inputSection: {
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,
  inputLabel: {
    marginBottom: Theme.spacing.md,
    fontSize: Theme.typography.fontSizes.xl,
    fontFamily: Theme.typography.fonts.regular,
    color: Theme.colors.primary,
    lineHeight: Theme.typography.fontSizes.xl,
    paddingTop: Theme.spacing.xs,
  } as TextStyle,
  input: {
    borderBottomWidth: 3,
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
    color: Theme.colors.primary,
    fontSize: Theme.typography.fontSizes.lg,
  } as TextStyle,
  teamInput: {
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
  } as ViewStyle,
  fullWidthButton: {
    flex: 1,
  } as ViewStyle,
  selectedButton: {
    backgroundColor: Theme.colors.button.primary,
  } as ViewStyle,
  selectedButtonText: {
    color: Theme.colors.button.text,
  } as TextStyle,
});
