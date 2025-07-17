import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import {ThemedText} from './ThemedText';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
}

export function Collapsible({title, children}: CollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = useTheme();

  return (
    <View>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <ThemedText style={[styles.title, {color: theme.colors.primary}]}>
          {isExpanded ? '▾' : '▸'} {title}
        </ThemedText>
      </TouchableOpacity>
      {isExpanded && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  content: {
    marginTop: 6,
  },
  title: {
    fontSize: 16,
  },
});
