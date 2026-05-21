import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

interface Props { current: number; total: number; markedDelete: number; markedKeep: number; }

export function GroupProgressBar({ current, total, markedDelete, markedKeep }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        {Array.from({ length: total }, (_, i) => {
          let bgColor = Tokens.color.textMuted;
          if (i < markedDelete + markedKeep) {
            bgColor = i < markedDelete ? Tokens.color.danger : Tokens.color.safe;
          } else if (i === current) {
            bgColor = Tokens.color.textPrimary;
          }
          return (
            <View key={i} style={[styles.dot, { backgroundColor: bgColor }, i === current && styles.dotCurrent]} />
          );
        })}
      </View>
      <Text style={styles.counter}>{current + 1} / {total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center', paddingHorizontal: Tokens.spacing.l },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: Tokens.spacing.s },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 3 },
  dotCurrent: { transform: [{ scale: 1.4 }] },
  counter: { ...Tokens.typography.caption, color: Tokens.color.textSecondary },
});
