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
    borderWidth: 1,
    borderColor: Theme.colors.border + '20', // very transparent border
  } as ViewStyle,
  card: {
    backgroundColor: Theme.colors.card.background,
    borderWidth: 1,
    borderColor: Theme.colors.card.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: Theme.colors.card.shadow,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  } as ViewStyle,
});
