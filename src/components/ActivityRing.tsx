import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors, FontSizes } from "../theme";

interface Props {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export default function ActivityRing({ progress, size = 150, strokeWidth = 12, color = Colors.primary }: Props) {
  const p = Math.min(Math.max(progress, 0), 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - p);

  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={Colors.surfaceLight} strokeWidth={strokeWidth} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeDasharray={`${circumference}`} strokeDashoffset={offset} rotation="-90" origin={`${size / 2}, ${size / 2}`} />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: Colors.text, fontWeight: "700", fontSize: size * 0.2 }}>{Math.round(p * 100)}%</Text>
        </View>
      </View>
    </View>
  );
}
