import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontWeight } from '../../constants/spacing';

const AVATAR_COLORS = ['#2E7D9B', '#E8734A', '#4CAF50', '#9C27B0', '#FF5722', '#607D8B'];

interface Props {
  name: string;
  size?: number;
  color?: string;
}

export function Avatar({ name, size = 36, color }: Props) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const bgColor = color ?? AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
});
