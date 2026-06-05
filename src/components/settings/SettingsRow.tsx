import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
          <MaterialCommunityIcons name="chevron-right" size={22} color={Tokens.color.textMuted} />
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
    paddingVertical: 20,
    paddingHorizontal: 22,
    minHeight: 62,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.055)',
  },
  rowCenter: {
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing.s,
  },
});
