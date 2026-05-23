import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

interface Props {
  current: number;
  total: number;
  deleteIndices: Set<number>;
  keepIndices: Set<number>;
  onSelectIndex?: (index: number) => void;
}

export function GroupProgressBar({ current, total, deleteIndices, keepIndices, onSelectIndex }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        {Array.from({ length: total }, (_, i) => {
          let bgColor = Tokens.color.textMuted;
          if (deleteIndices.has(i)) {
            bgColor = '#F5C542';
          } else if (keepIndices.has(i)) {
            bgColor = Tokens.color.safe;
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 110, left: 0, right: 0, alignItems: 'center', paddingHorizontal: Tokens.spacing.l },
  dots: { flexDirection: 'row', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 3 },
  dotCurrent: { transform: [{ scale: 1.35 }] },
});
