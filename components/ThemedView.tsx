import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
  ViewStyle,
  type ViewProps,
} from 'react-native';
import {Theme} from '../constants/Theme';
import {useTheme} from '../hooks/useTheme';

export type ThemedViewProps = ViewProps & {
  variant?: 'default' | 'card';
};

export function ThemedView({
  style,
  variant = 'default',
  ...rest
}: ThemedViewProps) {
  const theme = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'card':
        return theme.colors.card.background;
      default:
        return theme.colors.background;
    }
  };

  return (
    <View
      style={[
        styles.container,
        variant === 'card' && styles.card,
        {backgroundColor: getBackgroundColor()},
        variant === 'card' && {
          borderColor: theme.colors.card.border,
          shadowColor: theme.colors.card.shadow,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  card: {
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  } as ViewStyle,
});
