import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tokens } from '../../design-tokens';

interface Props {
  onPress?: () => void;
  disabled?: boolean;
  playing?: boolean;
}

export function LivePhotoBadge({ onPress, disabled = false, playing = false }: Props) {
  return (
    <Pressable
      testID="live-photo-badge"
      accessibilityRole="button"
      accessibilityLabel="播放 Live Photo"
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={[styles.badge, disabled && styles.disabled, playing && styles.playing]}
    >
      <View style={styles.mark}>
        <View style={styles.outerRing} />
        <View style={styles.innerDot} />
      </View>
      <Text style={styles.text}>LIVE</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 74,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: Tokens.radius.pill,
    backgroundColor: 'rgba(0,0,0,0.58)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.24)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  disabled: {
    opacity: 0.72,
  },
  playing: {
    borderColor: Tokens.color.accent,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  mark: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Tokens.color.textPrimary,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Tokens.color.textPrimary,
  },
  text: {
    fontSize: 11,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
    letterSpacing: 0,
  },
});
