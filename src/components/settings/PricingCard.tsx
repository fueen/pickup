import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

interface Props {
  label: string;
  price: string;
  period: string;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

export function PricingCard({
  label,
  price,
  period,
  isRecommended,
  isSelected,
  onSelect,
}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isRecommended && styles.recommended,
        isSelected && styles.selected,
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {isRecommended && <Text style={styles.badge}>推荐</Text>}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.price}>{price}</Text>
      <Text style={styles.period}>/ {period}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Tokens.color.surface,
    borderRadius: Tokens.radius.card,
    padding: Tokens.spacing.l,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recommended: {
    borderColor: Tokens.color.safe,
  },
  selected: {
    borderColor: Tokens.color.textPrimary,
  },
  badge: {
    ...Tokens.typography.caption,
    color: Tokens.color.safe,
    fontWeight: '700',
    marginBottom: Tokens.spacing.s,
  },
  label: {
    ...Tokens.typography.body,
    color: Tokens.color.textPrimary,
    marginBottom: Tokens.spacing.s,
  },
  price: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
  },
  period: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
  },
});
