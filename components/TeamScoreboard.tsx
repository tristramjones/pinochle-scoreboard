import {StyleSheet, View} from 'react-native';
import {Game} from '../types/game';
import {calculateTeamScore} from '../utils/scoring';
import {Theme} from '../constants/Theme';
import {CardFrame} from './CardFrame';
import {ThemedText} from './ThemedText';

export function TeamScoreboard({
  game,
  winnerId,
}: {
  game: Game;
  winnerId?: string;
}) {
  return (
    <CardFrame style={styles.container}>
      {game.teams.map((team, index) => (
        <View key={team.id} style={[styles.row, index > 0 && styles.divider]}>
          <View style={styles.team}>
            {team.id === winnerId && (
              <ThemedText style={styles.winner} accessibilityLabel="Winner">
                🏆 Winner
              </ThemedText>
            )}
            <ThemedText
              type="heading"
              style={styles.name}
              textBreakStrategy="highQuality"
              lineBreakStrategyIOS="standard"
            >
              {team.name}
            </ThemedText>
          </View>
          <ThemedText
            type="score"
            style={styles.score}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {calculateTeamScore(game, team.id)}
          </ThemedText>
        </View>
      ))}
    </CardFrame>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.md,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.card.border,
  },
  team: {flexGrow: 1, flexShrink: 0, flexBasis: 160, minWidth: 0},
  name: {fontSize: 20, lineHeight: 28},
  winner: {fontSize: 14, lineHeight: 22, color: Theme.colors.accent.gold},
  score: {
    width: 80,
    marginLeft: 'auto',
    textAlign: 'right',
    color: Theme.colors.accent.gold,
    fontSize: 32,
    lineHeight: 44,
    fontVariant: ['lining-nums', 'tabular-nums'],
  },
});
