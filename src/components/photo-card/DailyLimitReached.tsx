import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSubscriptionContext } from '../../contexts/SubscriptionContext';
import { Tokens } from '../../design-tokens';

export function DailyLimitReached() {
  const router = useRouter();
  const { todayGroupCount } = useSubscriptionContext();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const zzzOpacity = useRef(new Animated.Value(0)).current;
  const starPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle floating animation for the sleeping face
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    );
    float.start();

    // Zzz fade in stagger
    const zzz = Animated.loop(
      Animated.sequence([
        Animated.timing(zzzOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(zzzOpacity, {
          toValue: 0.3,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    zzz.start();

    // Star pulse
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(starPulse, {
          toValue: 1.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(starPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => {
      float.stop();
      zzz.stop();
      pulse.stop();
    };
  }, [floatAnim, zzzOpacity, starPulse]);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.container}>
      {/* Decorative background blobs */}
      <View style={styles.bgBlob1} />
      <View style={styles.bgBlob2} />

      {/* Illustration Area */}
      <View style={styles.illustrationArea}>
        {/* Outer glow ring */}
        <View style={styles.glowRing}>
          <View style={styles.glowInner} />
        </View>

        {/* Floating sparkles */}
        <Animated.Text style={[styles.sparkle, styles.sparkleTL, { transform: [{ scale: starPulse }] }]}>
          ✨
        </Animated.Text>
        <Animated.Text style={[styles.sparkle, styles.sparkleTR, { transform: [{ scale: starPulse }] }]}>
          ⭐
        </Animated.Text>
        <Animated.Text style={[styles.sparkle, styles.sparkleBL]}>
          💫
        </Animated.Text>

        {/* Main character */}
        <Animated.View style={{ transform: [{ translateY: floatY }] }}>
          <Text style={styles.mainCharacter}>😴</Text>
        </Animated.View>

        {/* Zzz floating */}
        <Animated.Text style={[styles.zzz1, { opacity: zzzOpacity }]}>💤</Animated.Text>
        <Animated.Text style={[styles.zzz2, { opacity: zzzOpacity.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }]}>
          💤
        </Animated.Text>
      </View>

      {/* Text Section */}
      <Text style={styles.title}>今日额度已用完</Text>
      <Text style={styles.subtitle}>
        免费用户每天可浏览 {Tokens.photo.freeDailyLimit} 组照片
      </Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{todayGroupCount}</Text>
          <Text style={styles.statLabel}>今日已浏览</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{Tokens.photo.freeDailyLimit}</Text>
          <Text style={styles.statLabel}>每日上限</Text>
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.upgradeButton}
        onPress={() => router.push('/paywall')}
        activeOpacity={0.8}
      >
        <Text style={styles.upgradeIcon}>⭐</Text>
        <Text style={styles.upgradeText}>升级 Pro 无限使用</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.laterButton}
        onPress={() => router.replace('/')}
        activeOpacity={0.8}
      >
        <Text style={styles.laterText}>明天再来</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.color.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing.xxl,
    overflow: 'hidden',
  },

  // Background blobs for depth
  bgBlob1: {
    position: 'absolute',
    top: '10%',
    left: '-30%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,204,0,0.04)',
  },
  bgBlob2: {
    position: 'absolute',
    bottom: '20%',
    right: '-20%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,204,0,0.03)',
  },

  // Illustration
  illustrationArea: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Tokens.spacing.xxl,
  },

  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(255,204,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,204,0,0.06)',
  },

  sparkle: {
    position: 'absolute',
    fontSize: 22,
  },
  sparkleTL: { top: 10, left: 20 },
  sparkleTR: { top: 20, right: 15 },
  sparkleBL: { bottom: 25, left: 30, fontSize: 18 },

  mainCharacter: {
    fontSize: 72,
  },

  zzz1: {
    position: 'absolute',
    top: -5,
    right: 25,
    fontSize: 28,
  },
  zzz2: {
    position: 'absolute',
    top: -25,
    right: 50,
    fontSize: 20,
  },

  // Text
  title: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.s,
  },
  subtitle: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.xl,
    lineHeight: 24,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Tokens.spacing.xxl,
    gap: Tokens.spacing.xxl,
  },
  statBox: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: 44,
    fontWeight: '700',
    color: Tokens.color.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: Tokens.color.textMuted,
  },

  // Buttons
  upgradeButton: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#FFCC00',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Tokens.spacing.m,
    gap: 8,
  },
  upgradeIcon: {
    fontSize: 18,
  },
  upgradeText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1,
  },
  laterButton: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  laterText: {
    fontSize: 16,
    fontWeight: '600',
    color: Tokens.color.textSecondary,
    letterSpacing: 1,
  },
});
