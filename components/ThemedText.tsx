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
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    lineHeight: 48,
  },
  heading: {
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 40,
  },
  score: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    textDecorationLine: 'underline',
  },
});
