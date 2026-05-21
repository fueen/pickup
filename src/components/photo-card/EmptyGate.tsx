import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

export function EmptyGate() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📷</Text>
      <Text style={styles.headline}>相册空空如也</Text>
      <Text style={styles.body}>去拍几张照片再来吧</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background, justifyContent: 'center', alignItems: 'center', padding: Tokens.spacing.xxl },
  icon: { fontSize: 64, marginBottom: Tokens.spacing.xl },
  headline: { ...Tokens.typography.headline, color: Tokens.color.textPrimary, textAlign: 'center', marginBottom: Tokens.spacing.s },
  body: { ...Tokens.typography.body, color: Tokens.color.textSecondary, textAlign: 'center' },
});
