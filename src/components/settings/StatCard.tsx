import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  onPress?: () => void;
  valueColor?: string;
}

export function StatCard({ label, value, unit, onPress, valueColor }: StatCardProps) {
  const inner = (
    <View style={styles.card}>
      <Text style={[styles.value, valueColor && { color: valueColor }]}>
        {value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
      <View style={styles.labelRow}>
        <Text style={[styles.label, onPress && styles.labelLink]}>{label}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.cardWrapper} onPress={onPress} activeOpacity={0.6}>
        {inner}
      </TouchableOpacity>
    );
  }

  return <View style={styles.cardWrapper}>{inner}</View>;
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: Tokens.color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: 80,
    minHeight: 86,
  },
  value: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
    marginBottom: 3,
    textAlign: 'left',
  },
  unit: {
    fontSize: 14,
    fontWeight: '900',
    color: Tokens.color.textSecondary,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.52)',
  },
  labelLink: {
    color: '#FF3B30',
  },
});
