import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

interface Props {
  current: number;
  total: number;
  markedDelete: number;
  markedKeep: number;
  onSelectIndex?: (index: number) => void;
}

export function GroupProgressBar({ current, total, markedDelete, markedKeep, onSelectIndex }: Props) {
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
            <TouchableOpacity
              key={i}
              onPress={() => onSelectIndex?.(i)}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[
                styles.dot,
                { backgroundColor: bgColor },
                i === current && styles.dotCurrent,
              ]}
            />
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
  dot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 3 },
  dotCurrent: { transform: [{ scale: 1.35 }] },
  counter: { ...Tokens.typography.caption, color: Tokens.color.textSecondary },
});
