import {StyleSheet, Text, TextStyle, type TextProps} from 'react-native';
import {Theme} from '../constants/Theme';
import {useTheme} from '../hooks/useTheme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'heading'
    | 'score'
    | 'label'
    | 'subtitle'
    | 'link';
};

export function ThemedText({
  style,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        {color: theme.colors.text},
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'heading' ? styles.heading : undefined,
        type === 'score' ? styles.score : undefined,
        type === 'label' ? styles.label : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link'
          ? [styles.link, {color: theme.colors.primary}]
          : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Theme.typography.fonts.regular,
    fontSize: Theme.typography.fontSizes.sm,
    lineHeight:
      Theme.typography.fontSizes.sm * Theme.typography.lineHeights.normal,
  } as TextStyle,
  title: {
    fontFamily: Theme.typography.fonts.bold,
    fontSize: Theme.typography.fontSizes.xxxl,
    lineHeight:
      Theme.typography.fontSizes.xxxl * Theme.typography.lineHeights.tight,
  } as TextStyle,
  heading: {
    fontFamily: Theme.typography.fonts.bold,
    fontSize: Theme.typography.fontSizes.xl,
    lineHeight:
      Theme.typography.fontSizes.xl * Theme.typography.lineHeights.tight,
  } as TextStyle,
  score: {
    fontFamily: Theme.typography.fonts.bold,
    fontSize: Theme.typography.fontSizes.lg,
    lineHeight:
      Theme.typography.fontSizes.lg * Theme.typography.lineHeights.normal,
  } as TextStyle,
  label: {
    fontFamily: Theme.typography.fonts.regular,
    fontSize: Theme.typography.fontSizes.md,
    lineHeight:
      Theme.typography.fontSizes.md * Theme.typography.lineHeights.normal,
  } as TextStyle,
  subtitle: {
    fontFamily: Theme.typography.fonts.bold,
    fontSize: Theme.typography.fontSizes.md,
    lineHeight:
      Theme.typography.fontSizes.md * Theme.typography.lineHeights.normal,
  } as TextStyle,
  link: {
    fontFamily: Theme.typography.fonts.regular,
    fontSize: Theme.typography.fontSizes.sm,
    lineHeight:
      Theme.typography.fontSizes.sm * Theme.typography.lineHeights.normal,
    textDecorationLine: 'underline',
  } as TextStyle,
});
