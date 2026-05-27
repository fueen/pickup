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
      style={styles.container}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <MaterialCommunityIcons name="delete-outline" size={18} color="#fff" />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
});
