import {PropsWithChildren} from 'react';
import {ThemedText} from './ThemedText';
import {Theme} from '../constants/Theme';

export function ScreenTitle({children}: PropsWithChildren) {
  return (
    <ThemedText
      type="title"
      accessibilityRole="header"
      style={{
        marginBottom: Theme.spacing.sm,
        textAlign: 'center',
        fontSize: 36,
        lineHeight: 48,
        fontFamily: Theme.typography.fonts.bold,
        color: Theme.colors.text,
      }}
    >
      {children}
    </ThemedText>
  );
}
