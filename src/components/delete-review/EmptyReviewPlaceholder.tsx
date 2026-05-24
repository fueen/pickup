import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tokens } from '../../design-tokens';

export function EmptyReviewPlaceholder() {
  return (
    <View style={styles.container}>
      {/* Cartoon illustration: framed picture with ghost */}
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
      <Text style={styles.title}>还没有待删除的照片</Text>
      <Text style={styles.subtitle}>浏览照片时上滑标记，这里就会出现啦</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  illustration: { width: 140, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  ghostWrap: { position: 'absolute', bottom: 10, right: 15 },
  sparkles: { position: 'absolute', top: 0, right: -5 },
  sparkle1: { position: 'absolute', top: -10, left: -8 },
  sparkle2: { position: 'absolute', top: -15, right: -12 },
  sparkle3: { position: 'absolute', bottom: -5, left: -15 },
  title: { ...Tokens.typography.title, color: Tokens.color.textPrimary, textAlign: 'center', marginBottom: 8 },
  subtitle: { ...Tokens.typography.caption, color: Tokens.color.textMuted, textAlign: 'center' },
});
