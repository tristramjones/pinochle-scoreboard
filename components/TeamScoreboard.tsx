import {StyleSheet, View, useWindowDimensions} from 'react-native';
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
  const {width, fontScale} = useWindowDimensions();
  // Give long words and larger accessibility text a full-width panel rather
  // than breaking a name into narrow fragments or shrinking it to fit.
  const stacked =
    width < 370 ||
    fontScale > 1.2 ||
    game.teams.some(
      team =>
        team.name.length > 18 ||
        team.name.split(/\s+/).some(word => word.length > 10),
    );
  return (
    <View style={[styles.container, stacked && styles.stacked]}>
      {game.teams.map(team => (
        <CardFrame
          key={team.id}
          style={[
            styles.panel,
            stacked ? styles.fullWidthPanel : styles.halfWidthPanel,
          ]}
        >
          <View style={styles.badge}>
            <ThemedText
              style={styles.symbol}
              accessibilityLabel={team.id === winnerId ? 'Winner' : undefined}
            >
              {team.id === winnerId ? '🏆' : '◇'}
            </ThemedText>
          </View>
          <ThemedText
            type="heading"
            style={[styles.name, stacked && styles.compactName]}
            textBreakStrategy="highQuality"
            lineBreakStrategyIOS="standard"
          >
            {team.name}
          </ThemedText>
          <View style={[styles.rule, stacked && styles.compactRule]} />
          <ThemedText
            type="score"
            style={[styles.score, stacked && styles.compactScore]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {calculateTeamScore(game, team.id)}
          </ThemedText>
        </CardFrame>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  stacked: {flexDirection: 'column'},
  panel: {
    minWidth: 0,
    padding: Theme.spacing.lg,
    alignItems: 'center',
  },
  fullWidthPanel: {
    flexShrink: 0,
    width: '100%',
    paddingVertical: Theme.spacing.md,
  },
  compactName: {fontSize: 22, lineHeight: 30},
  compactScore: {fontSize: 40, lineHeight: 54},
  compactRule: {marginVertical: Theme.spacing.sm},
  halfWidthPanel: {flex: 1},
  badge: {
    minHeight: 30,
    marginBottom: Theme.spacing.sm,
    justifyContent: 'center',
  },
  symbol: {fontSize: 22, lineHeight: 30, color: Theme.colors.accent.gold},
  name: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 34,
    flexShrink: 1,
  },
  rule: {
    height: 1,
    backgroundColor: Theme.colors.card.border,
    alignSelf: 'stretch',
    marginVertical: Theme.spacing.md,
  },
  score: {
    alignSelf: 'stretch',
    textAlign: 'center',
    color: Theme.colors.accent.gold,
    fontSize: 48,
    lineHeight: 64,
  },
});
