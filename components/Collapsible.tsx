import React, {useState} from 'react';
import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {Theme} from '../constants/Theme';
import {ThemedText} from './ThemedText';

type CollapsibleProps = {
  title: string;
  children: React.ReactNode;
};

export function Collapsible({title, children}: CollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <ThemedText style={styles.title} type="subtitle">
          {title}
        </ThemedText>
        <ThemedText style={styles.expandIcon}>
          {isExpanded ? '▼' : '▶'}
        </ThemedText>
      </TouchableOpacity>
      {isExpanded && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  } as ViewStyle,
  title: {
    color: Theme.colors.primary,
  } as TextStyle,
  expandIcon: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.textSecondary,
  } as TextStyle,
  content: {
    marginTop: Theme.spacing.sm,
  } as ViewStyle,
});
