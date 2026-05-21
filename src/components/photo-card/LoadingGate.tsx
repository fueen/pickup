import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

export function LoadingGate() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Tokens.color.textSecondary} />
      <Text style={styles.text}>正在加载你的照片回忆...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background, justifyContent: 'center', alignItems: 'center' },
  text: { ...Tokens.typography.body, color: Tokens.color.textSecondary, marginTop: Tokens.spacing.l },
});
