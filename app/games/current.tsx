import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Collapsible } from '../../components/Collapsible';
import VictoryScreen from '../../components/VictoryScreen';
import { useGame } from '../../contexts/GameContext';
import { Round } from '../../types/game';
import { calculateTeamScore } from '../../utils/scoring';

type RoundPhase = 'bid' | 'meld' | 'tricks';

export default function CurrentGameScreen() {
  const { currentGame, addRound } = useGame();

  const router = useRouter();
  const [phase, setPhase] = useState<RoundPhase>('bid');
  const [bidAmount, setBidAmount] = useState('');
  const [bidTeamId, setBidTeamId] = useState<string | null>(null);
  const [meldPoints, setMeldPoints] = useState<{ [key: string]: string }>({});
  const [trickPoints, setTrickPoints] = useState<{ [key: string]: string }>({});
  const [winningTeam, setWinningTeam] = useState<{ name: string; score: number } | null>(null);

  if (!currentGame) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Current Game</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Back to Games</Text>
        </TouchableOpacity>
      </View>
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
    const meldValues: { [key: string]: number } = {};

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
    if (!bidTeamId || !bidAmount) return;

    const meldValues: { [key: string]: number } = {};
    const trickValues: { [key: string]: number } = {};
    let totalTricks = 0;

    for (const team of currentGame.teams) {
      const meld = parseInt(meldPoints[team.id] || '0');
      const tricks = parseInt(trickPoints[team.id] || '0');

      if (isNaN(meld) || isNaN(tricks) || tricks < 0) {
        Alert.alert('Error', 'Please enter valid points for all teams');
        return;
      }

      meldValues[team.id] = meld;
      trickValues[team.id] = tricks;
      totalTricks += tricks;
    }

    // Validate total trick points
    if (totalTricks !== 250) {
      Alert.alert('Error', 'Total trick points must equal 250');
      return;
    }

    // For each team that got no tricks, their meld doesn't count
    currentGame.teams.forEach(team => {
      if (trickValues[team.id] === 0) {
        meldValues[team.id] = 0;
      }
    });

    const roundData = {
      bidWinner: bidTeamId,
      bid: parseInt(bidAmount),
      meld: meldValues,
      trickPoints: trickValues,
    };

    // Calculate new scores after this round
    const updatedGame = {
      ...currentGame,
      rounds: [...currentGame.rounds, { ...roundData, id: 'temp', timestamp: Date.now() }]
    };

    const scores = currentGame.teams.reduce((acc, team) => {
      acc[team.id] = calculateTeamScore(updatedGame, team.id);
      return acc;
    }, {} as { [key: string]: number });

    // Check if any team won
    const winner = currentGame.teams.find(team => scores[team.id] >= currentGame.winningScore);

    try {
      await addRound(roundData);

      if (winner) {
        setWinningTeam({
          name: winner.name,
          score: scores[winner.id]
        });
      } else {
        // Reset form only if game isn't over
        setBidAmount('');
        setBidTeamId(null);
        setMeldPoints({});
        setTrickPoints({});
        setPhase('bid');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit round');
    }
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
      <Text style={styles.phaseTitle}>Phase 1: Bid</Text>
      <View style={styles.bidSection}>
        <Text style={styles.label}>Bid Winner</Text>
        <View style={styles.teamButtons}>
          {currentGame.teams.map(team => (
            <TouchableOpacity
              key={team.id}
              style={[
                styles.teamButton,
                bidTeamId === team.id && styles.selectedTeam,
              ]}
              onPress={() => setBidTeamId(team.id)}
            >
              <Text 
                style={[
                  styles.teamButtonText,
                  bidTeamId === team.id && styles.selectedTeamText
                ]}
              >
                {team.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Bid Amount</Text>
        <TextInput
          style={styles.input}
          value={bidAmount}
          onChangeText={setBidAmount}
          keyboardType="number-pad"
          placeholder="Enter bid amount"
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitBid}
        >
          <Text style={styles.buttonText}>Submit Bid</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMeldPhase = () => (
    <View style={styles.phaseContainer}>
      <Text style={styles.phaseTitle}>Phase 2: Meld</Text>
      {currentGame.teams.map(team => (
        <View key={team.id} style={styles.teamInput}>
          <Text style={styles.teamName}>{team.name}</Text>
          <View style={styles.pointsInput}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Meld Points</Text>
              <TextInput
                style={styles.input}
                value={meldPoints[team.id] || ''}
                onChangeText={(value) => 
                  setMeldPoints(prev => ({ ...prev, [team.id]: value }))
                }
                keyboardType="number-pad"
                placeholder="Enter meld points"
              />
            </View>
          </View>
        </View>
      ))}

      {bidTeamId && bidAmount && Object.keys(meldPoints).length === currentGame.teams.length && (
        <View style={styles.requiredTricksInfo}>
          <Text style={styles.infoText}>
            {currentGame.teams.find(t => t.id === bidTeamId)?.name} needs{' '}
            {calculateRequiredTricks()} trick points to make their bid of {bidAmount}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmitMeld}
      >
        <Text style={styles.buttonText}>Submit Meld</Text>
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
          [otherTeam.id]: points <= 250 ? String(250 - points) : '0'
        });
      } else {
        setTrickPoints(prev => ({ ...prev, [teamId]: value }));
      }
    };

    return (
      <View style={styles.phaseContainer}>
        <Text style={styles.phaseTitle}>Phase 3: Tricks</Text>
        {currentGame.teams.map((team, index) => (
          <View key={team.id} style={styles.teamInput}>
            <Text style={styles.teamName}>{team.name}</Text>
            <View style={styles.pointsInput}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Trick Points</Text>
                <TextInput
                  style={styles.input}
                  value={trickPoints[team.id] || ''}
                  onChangeText={(value) => handleTrickPointsChange(team.id, value)}
                  keyboardType="number-pad"
                  placeholder="Enter trick points"
                  editable={index === 0} // Only first team can edit
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitTricks}
        >
          <Text style={styles.buttonText}>Submit Round</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRound = (round: Round, index: number) => {
    const bidWinningTeam = currentGame.teams.find(team => team.id === round.bidWinner);
    const roundNumber = index + 1;

    return (
      <View key={round.id} style={styles.roundCard}>
        <Text style={styles.roundTitle}>Round {roundNumber}</Text>
        
        <View style={styles.bidInfo}>
          <Text style={styles.bidText}>
            {bidWinningTeam?.name} bid {round.bid}
          </Text>
          {round.meld[round.bidWinner] + round.trickPoints[round.bidWinner] >= round.bid ? (
            <Text style={styles.madeBid}>Made Bid</Text>
          ) : (
            <Text style={styles.setBid}>Went set</Text>
          )}
        </View>

        <View style={styles.pointsTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Team</Text>
            <Text style={styles.tableCell}>Meld</Text>
            <Text style={styles.tableCell}>Tricks</Text>
            <Text style={styles.tableCell}>Total</Text>
            <Text style={styles.tableCell}>Game Score</Text>
          </View>
          {currentGame.teams.map(team => {
            const meldPoints = round.meld[team.id] || 0;
            const trickPoints = round.trickPoints[team.id] || 0;
            const roundTotal = meldPoints + trickPoints;
            
            // Calculate cumulative score up to this round
            const gameScore = currentGame.rounds
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
              <View key={team.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{team.name}</Text>
                <Text style={styles.tableCell}>{meldPoints}</Text>
                <Text style={styles.tableCell}>{trickPoints}</Text>
                <Text style={styles.tableCell}>{roundTotal}</Text>
                <Text style={[
                  styles.tableCell,
                  styles.gameScoreCell
                ]}>{gameScore}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.scoreHeader}>
          <Text style={styles.title}>Current Game</Text>
          {currentGame.teams.map(team => (
            <View key={team.id} style={styles.teamScore}>
              <Text style={styles.teamName}>{team.name}</Text>
              <Text style={styles.score}>
                Score: {calculateTeamScore(currentGame, team.id)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.roundInput}>
          <Text style={styles.sectionTitle}>New Round</Text>
          {phase === 'bid' && renderBidPhase()}
          {phase === 'meld' && renderMeldPhase()}
          {phase === 'tricks' && renderTricksPhase()}
        </View>

        {currentGame?.rounds?.length > 0 && (
          <View>
            <Collapsible title="Previous Rounds">
              <View style={styles.roundsContainer}>
                {currentGame.rounds.map((round, index) => renderRound(round, index))}
              </View>
            </Collapsible>
          </View>
        )}
      </ScrollView>
      {winningTeam && <VictoryScreen winningTeam={winningTeam} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreHeader: {
    marginBottom: 24,
  },
  teamScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roundInput: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  phaseContainer: {
    marginBottom: 24,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  bidSection: {
    marginBottom: 16,
  },
  teamButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  teamButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedTeam: {
    backgroundColor: '#007AFF',
  },
  teamButtonText: {
    fontSize: 16,
    color: '#000',
  },
  selectedTeamText: {
    color: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  teamInput: {
    marginBottom: 16,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  pointsInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
  },
  requiredTricksInfo: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
  score: {
    fontSize: 18,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  roundsContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  roundCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    color: '#666',
  },
  madeBid: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  setBid: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
  pointsTable: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  gameScoreCell: {
    fontWeight: '600',
    color: '#007AFF',
  },
}); 