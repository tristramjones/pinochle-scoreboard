import {useHeaderHeight} from '@react-navigation/elements';
import {
  Animated,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  type ScrollViewProps,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Theme} from '../constants/Theme';
import {useColorScheme} from '../hooks/useColorScheme';

type ParallaxScrollViewProps = ScrollViewProps & {
  headerBackgroundColor?: {
    light: string;
    dark: string;
  };
  headerHeight?: number;
  children: React.ReactNode;
};

export function ParallaxScrollView({
  headerBackgroundColor = {
    light: Theme.colors.background,
    dark: Theme.colors.background,
  },
  headerHeight: customHeaderHeight,
  children,
  ...rest
}: ParallaxScrollViewProps) {
  const colorScheme = useColorScheme();
  const defaultHeaderHeight = useHeaderHeight();
  const headerHeight = customHeaderHeight ?? defaultHeaderHeight;
  const {bottom} = useSafeAreaInsets();
  const scrollY = new Animated.Value(0);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            height: headerHeight,
            transform: [{translateY: headerTranslateY}],
            backgroundColor: headerBackgroundColor[colorScheme || 'light'],
          },
        ]}
      />
      <ScrollView
        {...rest}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true},
        )}
        scrollEventThrottle={16}
        contentContainerStyle={[
          rest.contentContainerStyle,
          {paddingBottom: bottom},
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    padding: Theme.spacing.xl,
  } as ViewStyle,
});
