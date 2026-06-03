import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tokens } from '../../design-tokens';

export function PawMark() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={[styles.toe, styles.toeLeft]} />
      <View style={[styles.toe, styles.toeMid]} />
      <View style={[styles.toe, styles.toeRight]} />
      <View style={[styles.toe, styles.toeTiny]} />
      <View style={styles.pad} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 46,
    height: 42,
    transform: [{ rotate: '10deg' }],
  },
  toe: {
    position: 'absolute',
    width: 12,
    height: 14,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  toeLeft: {
    left: 5,
    top: 8,
    backgroundColor: '#FF7A90',
  },
  toeMid: {
    left: 18,
    top: 2,
    backgroundColor: Tokens.color.accent,
  },
  toeRight: {
    right: 5,
    top: 8,
    backgroundColor: '#5AD7FF',
  },
  toeTiny: {
    right: 0,
    top: 21,
    width: 9,
    height: 10,
    backgroundColor: '#34C759',
  },
  pad: {
    position: 'absolute',
    left: 13,
    top: 19,
    width: 23,
    height: 21,
    borderRadius: 14,
    backgroundColor: '#F8F4E6',
    borderWidth: 2,
    borderColor: 'rgba(255,204,0,0.75)',
  },
});
