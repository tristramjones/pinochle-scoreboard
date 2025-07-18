import React from 'react';
import {Platform, StyleSheet, View, ViewStyle} from 'react-native';
import {Theme} from '../constants/Theme';

type ThemedViewProps = React.ComponentProps<typeof View> & {
  variant?: 'default' | 'card';
};

export function ThemedView({
  style,
  variant = 'default',
  ...props
}: ThemedViewProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'default' ? styles.default : styles.card,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  } as ViewStyle,
  default: {
    backgroundColor: Theme.colors.background,
  } as ViewStyle,
  card: {
    backgroundColor: Theme.colors.card.background,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: Theme.colors.card.shadow,
        shadowOffset: {width: 2, height: 3},
        shadowOpacity: 0.6,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  } as ViewStyle,
});
