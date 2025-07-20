import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {Theme} from '../constants/Theme';

interface ProgressDotsProps {
  totalSteps: number;
  currentStep: number;
  style?: ViewStyle;
}

export function ProgressDots({
  totalSteps,
  currentStep,
  style,
}: ProgressDotsProps) {
  return (
    <View style={[styles.container, style]}>
      {Array.from({length: totalSteps}).map((_, index) => (
        <React.Fragment key={index}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  index <= currentStep - 1
                    ? Theme.colors.primary
                    : Theme.colors.card.border,
              },
            ]}
          />
          {index < totalSteps - 1 && (
            <View
              style={[
                styles.line,
                {
                  backgroundColor:
                    index < currentStep - 1
                      ? Theme.colors.primary
                      : Theme.colors.card.border,
                },
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.lg,
  } as ViewStyle,
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  } as ViewStyle,
  line: {
    width: 24,
    height: 2,
    marginHorizontal: Theme.spacing.xs,
  } as ViewStyle,
});
