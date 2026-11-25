import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  View,
} from 'react-native';
import {Theme} from '../constants/Theme';
import {ThemedText} from './ThemedText';

export type ThemedButtonVariant = 'primary' | 'secondary';
export type ThemedButtonSize = 'sm' | 'md' | 'lg';

interface ThemedButtonProps extends TouchableOpacityProps {
  variant?: ThemedButtonVariant;
  size?: ThemedButtonSize;
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
  const buttonSize = Theme.button.sizes[size];

  const buttonStyles = [
    styles.base,
    {
      backgroundColor:
        variant === 'primary'
          ? Theme.colors.button.primary
          : Theme.colors.button.secondary,
      minHeight: buttonSize.height,
      paddingVertical: Theme.spacing.sm,
      borderWidth: 1,
      borderColor: Theme.colors.accent.gold,
      paddingHorizontal: buttonSize.paddingHorizontal,
      borderRadius: Theme.borderRadius.lg,
      opacity: disabled ? 0.6 : 1,
    },
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color:
        variant === 'primary'
          ? Theme.colors.button.text
          : Theme.colors.button.textSecondary,
      fontSize: buttonSize.fontSize,
      lineHeight: buttonSize.fontSize * buttonSize.lineHeight,
      fontFamily: Theme.typography.fonts.editorial,
    },
    textStyle,
  ];

  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={buttonStyles}
      disabled={disabled}
      {...rest}
    >
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            margin: 4,
            borderRadius: 6,
            borderWidth: 1,
            borderColor:
              variant === 'primary' ? '#A87934' : Theme.colors.card.border,
          },
        ]}
      />
      <ThemedText style={textStyles}>{title}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  text: {
    textAlign: 'center',
  } as TextStyle,
});
