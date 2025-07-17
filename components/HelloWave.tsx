import React from 'react';
import {StyleSheet, Text, TextStyle} from 'react-native';
import {Theme} from '../constants/Theme';

export function HelloWave() {
  return <Text style={styles.wave}>👋</Text>;
}

const styles = StyleSheet.create({
  wave: {
    fontSize: Theme.typography.fontSizes.xl,
    lineHeight:
      Theme.typography.fontSizes.xl * Theme.typography.lineHeights.normal,
  } as TextStyle,
});
