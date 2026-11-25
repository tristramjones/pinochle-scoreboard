import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import {CardFrame} from './CardFrame';
import {Theme} from '../constants/Theme';
import {ThemedText} from './ThemedText';

export type ThemedButtonVariant =
  'primary' | 'secondary' | 'destructive' | 'text';
export type ThemedButtonSize = 'sm' | 'md' | 'lg';
interface ThemedButtonProps extends TouchableOpacityProps {
  variant?: ThemedButtonVariant;
  size?: ThemedButtonSize;
  title: string;
  selected?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function ThemedButton({
  variant = 'primary',
  size = 'md',
  title,
  selected,
  loading = false,
  style,
  textStyle,
  disabled = false,
  accessibilityState,
  ...rest
}: ThemedButtonProps) {
  const dimensions = Theme.button.sizes[size];
  const filled = selected || variant === 'primary';
  const blocked = disabled || loading;
  const color = filled
    ? Theme.colors.button.text
    : variant === 'destructive'
      ? Theme.colors.accent.destructive
      : Theme.colors.button.textSecondary;
  return (
    <TouchableOpacity
      {...rest}
      accessibilityRole="button"
      accessibilityState={{
        ...accessibilityState,
        disabled: blocked,
        ...(selected !== undefined ? {selected} : {}),
        busy: loading,
      }}
      aria-disabled={blocked}
      aria-busy={loading}
      {...(Platform.OS === 'web' && selected !== undefined
        ? {'aria-pressed': selected}
        : {})}
      disabled={blocked}
      activeOpacity={Theme.button.activeOpacity}
      style={[
        styles.base,
        {
          minHeight: dimensions.height,
          paddingHorizontal:
            variant === 'text'
              ? Theme.spacing.sm
              : dimensions.paddingHorizontal,
          backgroundColor:
            filled || variant === 'text'
              ? 'transparent'
              : Theme.colors.button.secondary,
          // Reserve the same border space in every state to prevent reflow.
          borderWidth: 1,
          borderColor:
            filled || variant === 'text'
              ? 'transparent'
              : variant === 'destructive'
                ? Theme.colors.accent.destructive
                : Theme.colors.accent.gold,
        },
        variant === 'text' && styles.compact,
        style,
        blocked && styles.disabled,
      ]}
    >
      {filled ? (
        <CardFrame
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, {padding: 0}]}
          fillColor={Theme.colors.button.primary}
        />
      ) : (
        variant !== 'text' && (
          <View
            pointerEvents="none"
            style={[
              styles.innerBorder,
              {
                borderColor:
                  variant === 'destructive'
                    ? Theme.colors.accent.destructive
                    : Theme.colors.card.border,
              },
            ]}
          />
        )
      )}
      <View style={[styles.label, variant === 'text' && styles.compactLabel]}>
        {loading && (
          <ActivityIndicator size="small" color={color} accessible={false} />
        )}
        <ThemedText
          style={[
            styles.text,
            {
              color,
              fontSize: variant === 'text' ? 17 : dimensions.fontSize,
              lineHeight:
                (variant === 'text' ? 17 : dimensions.fontSize) *
                dimensions.lineHeight,
            },
            textStyle,
          ]}
        >
          {title}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
  },
  disabled: {opacity: Theme.button.disabledOpacity},
  compact: {alignSelf: 'center', minWidth: 44},
  compactLabel: {width: 'auto'},
  label: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
    flexShrink: 1,
  },
  innerBorder: {
    ...StyleSheet.absoluteFill,
    margin: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  text: {
    textAlign: 'center',
    fontFamily: Theme.typography.fonts.regular,
    flexShrink: 1,
  },
});
