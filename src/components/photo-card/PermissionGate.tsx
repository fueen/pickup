import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Tokens } from '../../design-tokens';
import { PermissionStatus } from '../../types/photo';

interface Props {
  status: PermissionStatus;
  onRequest: () => void;
}

export function PermissionGate({ status, onRequest }: Props) {
  if (status === 'granted' || status === 'limited') return null;
  const isDenied = status === 'denied';
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📸</Text>
      <Text style={styles.headline}>{isDenied ? '需要相册访问权限' : '拾遗需要访问你的相册'}</Text>
      <Text style={styles.body}>
        {isDenied
          ? '请在系统设置中允许拾遗访问相册。照片完全在本机处理，不会上传。'
          : '拾遗会随机回顾你的照片，帮你顺手清理废片。照片完全在本机处理，不会上传。'}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={isDenied ? () => Linking.openSettings() : onRequest}
      >
        <Text style={styles.buttonText}>{isDenied ? '打开系统设置' : '允许访问相册'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background, justifyContent: 'center', alignItems: 'center', padding: Tokens.spacing.xxl },
  icon: { fontSize: 64, marginBottom: Tokens.spacing.xl },
  headline: { ...Tokens.typography.headline, color: Tokens.color.textPrimary, textAlign: 'center', marginBottom: Tokens.spacing.m },
  body: { ...Tokens.typography.body, color: Tokens.color.textSecondary, textAlign: 'center', marginBottom: Tokens.spacing.xxl, lineHeight: 24 },
  button: { backgroundColor: Tokens.color.safe, paddingHorizontal: Tokens.spacing.xxl, paddingVertical: Tokens.spacing.m, borderRadius: Tokens.radius.button },
  buttonText: { ...Tokens.typography.title, color: '#FFFFFF' },
});
