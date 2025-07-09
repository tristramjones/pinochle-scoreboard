import { View, type ViewProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export type ThemedViewProps = ViewProps;

export function ThemedView({ style, ...otherProps }: ThemedViewProps) {
  const { colors } = useTheme();
  return <View style={[{ backgroundColor: colors.background }, style]} {...otherProps} />;
}
