import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  count: number;
  onPress: () => void;
  loading?: boolean;
}

export function QuickDeleteButton({ count, onPress, loading }: Props) {
  if (count === 0) return null;

  return (
    <TouchableOpacity
      style={styles.pill}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name="delete-outline" size={16} color="#fff" />
      <Text style={styles.label}>删除</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  label: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
});
