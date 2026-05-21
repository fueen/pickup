import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

interface SettingsRowProps {
  label: string;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  showArrow?: boolean;
}

export function SettingsRow({
  label,
  rightContent,
  onPress,
  showArrow = true,
}: SettingsRowProps) {
  const Inner = (
    <View style={[styles.row, rightContent ? null : styles.rowCenter]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.right}>
        {rightContent}
        {showArrow && onPress ? (
          <Text style={styles.arrow}>{'>'}</Text>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        {Inner}
      </TouchableOpacity>
    );
  }

  return <View style={styles.wrapper}>{Inner}</View>;
}

const styles = StyleSheet.create({
  wrapper: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Tokens.spacing.l,
    paddingHorizontal: Tokens.spacing.l,
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Tokens.color.textMuted,
  },
  rowCenter: {
    alignItems: 'center',
  },
  label: {
    ...Tokens.typography.body,
    color: Tokens.color.textPrimary,
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing.s,
  },
  arrow: {
    color: Tokens.color.textMuted,
    fontSize: 18,
    fontWeight: '600',
  },
});
