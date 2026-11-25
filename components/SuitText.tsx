import {Palette} from '../constants/Theme';
import {Fragment} from 'react';
import {Platform, StyleSheet, Text} from 'react-native';

export const suitStyles = StyleSheet.create({
  symbol: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'Arial',
    }),
    fontStyle: 'normal',
    fontWeight: 'normal',
    textShadowColor: Palette.brassLight,
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 1.5,
  },
  red: {color: Palette.suitRed},
  black: {color: Palette.suitBlack},
});

// Suits use the system font so decorative body fonts cannot drop their glyphs.
export function SuitText({text}: {text: string}) {
  return (
    <>
      {text.split(/([♠♣♥♦])\uFE0E?/).map((part, index) =>
        /^[♠♣♥♦]$/.test(part) ? (
          <Text
            key={index}
            style={[
              suitStyles.symbol,
              part === '♠' || part === '♣' ? suitStyles.black : suitStyles.red,
            ]}
          >
            {part}
            {'\uFE0E'}
          </Text>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
