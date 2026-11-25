import {Fragment} from 'react';
import {StyleSheet, Text} from 'react-native';

export const suitStyles = StyleSheet.create({
  black: {
    color: '#111111',
    textShadowColor: '#D8BF8E',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 1.5,
  },
});

// Nested native Text preserves the surrounding paragraph’s font and size.
export function SuitText({text}: {text: string}) {
  return (
    <>
      {text.split(/([♠♣])/).map((part, index) =>
        part === '♠' || part === '♣' ? (
          <Text key={index} style={suitStyles.black}>
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
