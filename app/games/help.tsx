import {SuitText} from '../../components/SuitText';
import {ScreenTitle} from '../../components/ScreenTitle';
import {CardFrame} from '../../components/CardFrame';
import {TableScrollView} from '../../components/TableScrollView';
import {StyleSheet, View} from 'react-native';
import {ThemedText} from '../../components/ThemedText';
import {Theme} from '../../constants/Theme';

const melds = [
  ['Family', 'A, 10, K, Q, J of trump', '150'],
  ['Double family', 'Two complete trump families', '1,500'],
  ['Royal marriage', 'K and Q of trump', '40'],
  ['Marriage', 'K and Q of the same non-trump suit', '20'],
  ['Pinochle', 'Q♠ and J♦', '40'],
  ['Double pinochle', 'Both Q♠ and both J♦', '300'],
  ['Round of Aces', 'One ace in each suit', '100'],
  ['Round of Kings', 'One king in each suit', '80'],
  ['Round of Queens', 'One queen in each suit', '60'],
  ['Round of Jacks', 'One jack in each suit', '40'],
  ['Double Round of Aces', 'Two aces in each suit', '1,000'],
  ['Double Round of Kings', 'Two kings in each suit', '800'],
  ['Double Round of Queens', 'Two queens in each suit', '600'],
  ['Double Round of Jacks', 'Two jacks in each suit', '400'],
];

export default function ScoringHelpScreen() {
  return (
    <TableScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <ScreenTitle>Scoring help</ScreenTitle>
      <View style={styles.sections}>
        <ThemedText type="heading" accessibilityRole="header">
          Meld reference
        </ThemedText>
        <ThemedText style={styles.body}>
          Add each partner’s meld to get the team’s total.
        </ThemedText>
        <View style={styles.table}>
          {melds.map(([name, cards, points]) => (
            <View key={name} style={styles.row}>
              <View style={styles.description}>
                <ThemedText type="subtitle">{name}</ThemedText>
                <ThemedText style={styles.detail}>
                  <SuitText text={cards} />
                </ThemedText>
              </View>
              <ThemedText type="score" accessibilityLabel={`${points} points`}>
                {points}
              </ThemedText>
            </View>
          ))}
        </View>
        <ThemedText style={styles.body}>
          <SuitText text="A family’s 150 points already includes its trump marriage. For example, a spade family plus J♦ scores 190: 150 for the family and 40 for pinochle using its Q♠. Double melds replace their single values." />
        </ThemedText>

        <CardFrame style={styles.callout}>
          <ThemedText type="heading">Win a trick to count meld</ThemedText>
          <ThemedText style={styles.body}>
            Your team must take at least one trick to count its meld.
          </ThemedText>
        </CardFrame>

        <ThemedText type="heading" accessibilityRole="header">
          Trick points
        </ThemedText>
        <ThemedText style={styles.body}>
          Each captured ace, 10, and king is worth 10 points. The last trick
          adds 10. Total: 250 points.
        </ThemedText>

        <ThemedText type="heading" accessibilityRole="header">
          Making the bid
        </ThemedText>
        <ThemedText style={styles.body}>
          If the bidding team’s countable meld plus trick points reaches its
          bid, it scores that total. Otherwise, it loses the bid amount. The
          other team keeps meld plus trick points when it takes at least one
          trick.
        </ThemedText>
        <CardFrame style={styles.callout}>
          <ThemedText type="subtitle">Example: bid 300</ThemedText>
          <ThemedText style={styles.body}>
            100 meld + 200 tricks = +300 points. With only 150 tricks, the total
            is 250, so the team scores −300.
          </ThemedText>
        </CardFrame>

        <ThemedText type="heading" accessibilityRole="header">
          Shoot the moon
        </ThemedText>
        <ThemedText style={styles.body}>
          One player must take all 12 tricks. A successful attempt scores
          +1,500; a failed attempt scores −1,500. The other team scores zero.
        </ThemedText>

        <ThemedText type="heading" accessibilityRole="header">
          Winning the game
        </ThemedText>
        <ThemedText style={styles.body}>
          A team wins by reaching at least 1,500 points or leading the other
          team by at least 1,500 points. If both teams finish a round with at
          least 1,500 points, the team with the higher score wins.
        </ThemedText>
      </View>
    </TableScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Theme.colors.background},
  content: {padding: Theme.spacing.lg, paddingBottom: Theme.spacing.xxl},
  sections: {gap: Theme.spacing.md, marginTop: Theme.spacing.md},
  body: {fontSize: Theme.typography.fontSizes.lg, lineHeight: 28},
  detail: {
    fontSize: Theme.typography.fontSizes.md,
    lineHeight: 24,
    color: Theme.colors.textSecondary,
  },
  callout: {
    backgroundColor: Theme.colors.card.background,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  table: {borderTopWidth: 1, borderColor: Theme.colors.card.border},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: Theme.colors.card.border,
  },
  description: {flex: 1},
});
