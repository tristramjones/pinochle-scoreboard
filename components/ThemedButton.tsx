import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import {ThemedText} from './ThemedText';

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
  const theme = useTheme();

  const buttonStyles = [
    styles.base,
    {
      backgroundColor:
        variant === 'primary'
          ? theme.colors.button.primary
          : theme.colors.button.secondary,
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
          ? theme.colors.button.text
          : theme.colors.button.textSecondary,
      fontSize: theme.typography.fontSizes['lg'],
    },
    textStyle,
  ];

  return (
    <TouchableOpacity style={buttonStyles} disabled={disabled} {...rest}>
      <ThemedText style={textStyles}>{title}</ThemedText>
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
  } as TextStyle,
});
