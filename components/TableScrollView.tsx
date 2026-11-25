import React from 'react';
import {ScrollView, ScrollViewProps, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CardFrame} from './CardFrame';
import {RoomMasthead} from './RoomMasthead';
import {Theme} from '../constants/Theme';

export function TableScrollView({style, children, ...props}: ScrollViewProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.table,
        {
          paddingBottom: insets.bottom + 12,
          paddingLeft: insets.left + 8,
          paddingRight: insets.right + 8,
        },
      ]}
    >
      <CardFrame style={styles.frame} fillColor={Theme.colors.background}>
        <View style={styles.viewport}>
          <ScrollView style={[style, styles.scroll]} {...props}>
            <RoomMasthead />
            {children}
          </ScrollView>
        </View>
      </CardFrame>
    </View>
  );
}
const styles = StyleSheet.create({
  table: {flex: 1, backgroundColor: Theme.colors.background, paddingTop: 8},
  frame: {flex: 1, padding: 16},
  // Keep the scrolling rectangle inside the concave corners of the frame.
  viewport: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Theme.colors.background,
  },
  scroll: {backgroundColor: 'transparent'},
});
