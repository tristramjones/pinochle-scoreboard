import {suitStyles} from './SuitText';
import {StyleSheet, View} from 'react-native';
import {ThemedText} from './ThemedText';
import {Theme} from '../constants/Theme';

export function OrnamentalRule({suits = false}: {suits?: boolean}) {
  return (
    <View
      style={styles.rule}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.line} />
      <ThemedText style={[styles.suits, suits && suitStyles.black]}>
        {suits ? (
          <>
            ♠︎ <ThemedText style={styles.redSuits}>♥︎ ♦︎</ThemedText> ♣︎
          </>
        ) : (
          '◇'
        )}
      </ThemedText>
      <View style={styles.line} />
    </View>
  );
}
export function RoomMasthead() {
  return (
    <View style={styles.masthead}>
      <ThemedText
        style={styles.name}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        accessibilityRole="header"
      >
        The Pinochle Room
      </ThemedText>
      <OrnamentalRule suits />
    </View>
  );
}
const styles = StyleSheet.create({
  masthead: {paddingTop: 8, marginBottom: 24, alignItems: 'center'},
  name: {
    fontFamily: 'CormorantSC',
    fontSize: 30,
    lineHeight: 42,
    color: Theme.colors.text,
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 10,
    alignSelf: 'stretch',
  },
  line: {height: 1, flex: 1, backgroundColor: Theme.colors.card.border},
  redSuits: {
    color: '#D32F2F',
    textShadowRadius: 0,
    fontSize: 21,
    lineHeight: 28,
  },
  suits: {color: Theme.colors.accent.gold, fontSize: 21, lineHeight: 28},
});
