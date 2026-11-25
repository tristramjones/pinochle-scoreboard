import {ComponentProps} from 'react';
import {StyleSheet, View} from 'react-native';
import {Theme} from '../constants/Theme';

export function ThemedView({style, ...props}: ComponentProps<typeof View>) {
  return <View style={[styles.container, style]} {...props} />;
}
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Theme.colors.background},
});
