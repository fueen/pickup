import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tokens } from '../src/design-tokens';

export default function HubScreen() {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="apps" size={64} color={Tokens.color.textMuted} />
      <Text style={styles.title}>更多功能</Text>
      <Text style={styles.subtitle}>敬请期待</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.color.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Tokens.typography.title,
    color: Tokens.color.textPrimary,
    marginTop: Tokens.spacing.l,
  },
  subtitle: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
    marginTop: Tokens.spacing.s,
  },
});
