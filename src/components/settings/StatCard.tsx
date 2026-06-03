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
    backgroundColor: '#000000',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: Tokens.radius.card,
    paddingVertical: Tokens.spacing.l,
    paddingHorizontal: Tokens.spacing.m,
    alignItems: 'center',
    minWidth: 80,
  },
  value: {
    ...Tokens.typography.title,
    color: Tokens.color.textPrimary,
    marginBottom: Tokens.spacing.xs,
    textAlign: 'center',
  },
  unit: {
    fontSize: 13,
    color: Tokens.color.textSecondary,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Tokens.color.textSecondary,
  },
  labelLink: {
    color: '#FF3B30',
  },
});
