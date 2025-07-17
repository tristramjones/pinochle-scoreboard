import {StyleSheet, Text, type TextProps} from 'react-native';
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
    fontFamily: 'CrimsonText',
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontFamily: 'CrimsonText-Bold',
    fontSize: 40,
    lineHeight: 48,
  },
  heading: {
    fontFamily: 'CrimsonText-Bold',
    fontSize: 32,
    lineHeight: 40,
  },
  score: {
    fontFamily: 'CrimsonText-Bold',
    fontSize: 24,
    lineHeight: 32,
  },
  label: {
    fontFamily: 'CrimsonText',
    fontSize: 18,
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: 'CrimsonText-Bold',
    fontSize: 20,
    lineHeight: 28,
  },
  link: {
    fontFamily: 'CrimsonText',
    fontSize: 16,
    lineHeight: 24,
    textDecorationLine: 'underline',
  },
});
