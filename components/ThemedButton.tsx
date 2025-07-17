import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import {useTheme} from '../hooks/useTheme';

export type ThemedButtonVariant = 'primary' | 'secondary';

interface ThemedButtonProps extends TouchableOpacityProps {
  variant?: ThemedButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  title: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function ThemedButton({
  variant = 'primary',
  size = 'md',
  title,
  style,
  textStyle,
  disabled,
  ...rest
}: ThemedButtonProps) {
  const {theme, colors} = useTheme();

  const buttonStyles = [
    styles.base,
    {
      backgroundColor:
        variant === 'primary' ? colors.button.primary : colors.button.secondary,
      paddingVertical:
        theme.spacing[size === 'sm' ? 'xs' : size === 'lg' ? 'lg' : 'md'],
      paddingHorizontal:
        theme.spacing[size === 'sm' ? 'sm' : size === 'lg' ? 'xl' : 'lg'],
      borderRadius: theme.borderRadius[size === 'sm' ? 'sm' : 'md'],
      opacity: disabled ? 0.6 : 1,
    },
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color:
        variant === 'primary'
          ? colors.button.text
          : colors.button.textSecondary,
      fontSize:
        theme.typography.fontSizes[
          size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'
        ],
      fontWeight: theme.typography.fontWeights
        .semibold as TextStyle['fontWeight'],
    },
    textStyle,
  ];

  return (
    <TouchableOpacity style={buttonStyles} disabled={disabled} {...rest}>
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
