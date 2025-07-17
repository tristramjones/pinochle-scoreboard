import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useTheme} from '../hooks/useTheme';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
}

export function Collapsible({title, children}: CollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {colors} = useTheme();

  return (
    <View>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={[styles.title, {color: colors.primary}]}>
          {isExpanded ? '▼' : '▶'} {title}
        </Text>
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
    fontWeight: '600',
  },
});
