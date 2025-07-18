import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {Theme} from '../constants/Theme';

type BackgroundPatternProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function BackgroundPattern({children, style}: BackgroundPatternProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.md,
  } as ViewStyle,
});
