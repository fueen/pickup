import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Tokens } from '../../design-tokens';

interface Props {
  visible: boolean;
  count: number;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmSheet({ visible, count, loading, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>确认删除</Text>
          <Text style={styles.body}>
            将删除 {count} 张照片，删除后可在系统「最近删除」中恢复（30 天内）
          </Text>
          <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={onConfirm} disabled={loading}>
            <Text style={styles.deleteText}>{loading ? '删除中...' : `删除 ${count} 张`}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onCancel}>
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Tokens.color.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Tokens.spacing.xl, paddingBottom: Tokens.spacing.xxl + 20 },
  title: { ...Tokens.typography.title, color: Tokens.color.textPrimary, textAlign: 'center', marginBottom: Tokens.spacing.m },
  body: { ...Tokens.typography.body, color: Tokens.color.textSecondary, textAlign: 'center', marginBottom: Tokens.spacing.xl, lineHeight: 22 },
  button: { paddingVertical: Tokens.spacing.l, alignItems: 'center', marginBottom: Tokens.spacing.s },
  deleteButton: { backgroundColor: Tokens.color.danger, borderRadius: Tokens.radius.button },
  deleteText: { ...Tokens.typography.title, color: '#FFFFFF' },
  cancelText: { ...Tokens.typography.body, color: Tokens.color.textSecondary },
});
