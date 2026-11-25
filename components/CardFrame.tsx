import {PropsWithChildren, useId, useState} from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg';
import {Theme} from '../constants/Theme';

/** A continuous gilded edge with concave corners, drawn at its actual size. */
export function CardFrame({
  children,
  style,
  onLayout,
  fillColor = Theme.colors.card.background,
  ...props
}: PropsWithChildren<ViewProps & {fillColor?: string}>) {
  const [size, setSize] = useState({width: 0, height: 0});
  const gradient = `gold${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const {width: w, height: h} = size;
  const inset = 3;
  const corner = Math.min(20, w / 4, h / 4);
  const path = `M ${corner} ${inset}
    H ${w - corner} Q ${w - corner + 3} ${corner - 4} ${w - inset} ${corner}
    V ${h - corner} Q ${w - corner + 3} ${h - corner + 4} ${w - corner} ${h - inset}
    H ${corner} Q ${corner - 3} ${h - corner + 4} ${inset} ${h - corner}
    V ${corner} Q ${corner - 3} ${corner - 4} ${corner} ${inset} Z`;
  return (
    <View
      {...props}
      style={[styles.frame, style, styles.transparent]}
      onLayout={event => {
        const {width, height} = event.nativeEvent.layout;
        setSize(previous =>
          previous.width === width && previous.height === height
            ? previous
            : {width, height},
        );
        onLayout?.(event);
      }}
    >
      {w > 0 && h > 0 && (
        <Svg
          pointerEvents="none"
          accessible={false}
          style={StyleSheet.absoluteFill}
          width={w}
          height={h}
        >
          <Defs>
            <LinearGradient id={gradient} x1="0" y1="0" x2="0.65" y2="1">
              <Stop offset="0" stopColor="#F3D398" />
              <Stop offset="0.3" stopColor="#AC762E" />
              <Stop offset="0.6" stopColor="#F7DCA3" />
              <Stop offset="1" stopColor="#BA863F" />
            </LinearGradient>
          </Defs>
          <Path
            d={path}
            fill={fillColor}
            stroke="#533012"
            strokeWidth={6}
            strokeLinejoin="round"
          />
          <Path
            d={path}
            fill="none"
            stroke={`url(#${gradient})`}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <Path
            d={path}
            fill="none"
            stroke="#FFE5AE"
            strokeOpacity={0.65}
            strokeWidth={0.65}
            strokeLinejoin="round"
          />
        </Svg>
      )}
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  frame: {padding: 20},
  transparent: {backgroundColor: 'transparent'},
});
