import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../design-tokens';

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.wrapper}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.container}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Tokens.spacing.xl,
  },
  title: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Tokens.spacing.s,
    marginLeft: Tokens.spacing.l,
  },
  container: {
    backgroundColor: Tokens.color.surface,
    borderRadius: Tokens.radius.card,
    overflow: 'hidden',
  },
});
