import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
}

export function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>
        {value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Tokens.color.surface,
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
  },
  unit: {
    fontSize: 13,
    color: Tokens.color.textSecondary,
  },
  label: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
  },
});
