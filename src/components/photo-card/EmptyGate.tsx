import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tokens } from '../../design-tokens';

export function EmptyGate() {
  return (
    <View style={styles.container}>
      {/* Illustration: matching EmptyReviewPlaceholder style */}
      <View style={styles.illustration}>
        <MaterialCommunityIcons name="image-outline" size={80} color={Tokens.color.textMuted} />
        <View style={styles.ghostWrap}>
          <MaterialCommunityIcons name="ghost-outline" size={48} color={Tokens.color.accent} />
        </View>
        <View style={styles.sparkles}>
          <MaterialCommunityIcons name="star-four-points" size={14} color={Tokens.color.accent} style={styles.sparkle1} />
          <MaterialCommunityIcons name="star-four-points" size={10} color={Tokens.color.accent} style={styles.sparkle2} />
          <MaterialCommunityIcons name="star-four-points" size={12} color={Tokens.color.accent} style={styles.sparkle3} />
        </View>
      </View>
      <Text style={styles.title}>还没有可整理的照片</Text>
      <Text style={styles.subtitle}>去拍几张照片，或者换个相册看看吧</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.color.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Tokens.spacing.xxl,
  },
  illustration: {
    width: 140,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  ghostWrap: { position: 'absolute', bottom: 10, right: 15 },
  sparkles: { position: 'absolute', top: 0, right: -5 },
  sparkle1: { position: 'absolute', top: -10, left: -8 },
  sparkle2: { position: 'absolute', top: -15, right: -12 },
  sparkle3: { position: 'absolute', bottom: -5, left: -15 },
  title: {
    ...Tokens.typography.title,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...Tokens.typography.caption,
    color: Tokens.color.textMuted,
    textAlign: 'center',
  },
});
