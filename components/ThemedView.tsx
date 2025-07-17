import {StyleSheet, View, type ViewProps} from 'react-native';
import {useTheme} from '../hooks/useTheme';

export type ThemedViewProps = ViewProps & {
  variant?: 'default' | 'card' | 'surface';
};

export function ThemedView({
  style,
  variant = 'default',
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'card':
        return theme.colors.card.background;
      case 'surface':
        return theme.colors.surface;
      default:
        return theme.colors.background;
    }
  };

  return (
    <View
      style={[
        {backgroundColor: getBackgroundColor()},
        variant === 'card' && styles.card,
        variant === 'card' && {
          borderColor: theme.colors.card.border,
          shadowColor: theme.colors.card.shadow,
          ...theme.shadows.md,
        },
        style,
      ]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
});
