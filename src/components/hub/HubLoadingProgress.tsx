import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tokens } from '../../design-tokens';

export function HubLoadingProgress() {
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sweep = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    );
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    sweep.start();
    breathe.start();

    return () => {
      sweep.stop();
      breathe.stop();
    };
  }, [progress, pulse]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: ['18%', '78%', '18%'],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-18, 160],
  });
  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.06],
  });
  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.28, 0.62],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconHalo, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}>
        <MaterialCommunityIcons name="chart-bar" size={28} color={Tokens.color.accent} />
      </Animated.View>
      <Text style={styles.title}>正在整理月份记忆</Text>
      <Text style={styles.subtitle}>照片越多，第一次分析会稍微久一点</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: fillWidth, transform: [{ translateX }] }]} />
        <Animated.View style={[styles.spark, { transform: [{ translateX }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Tokens.spacing.xl,
    backgroundColor: Tokens.color.background,
  },
  iconHalo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,204,0,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,204,0,0.36)',
    marginBottom: 22,
  },
  title: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: Tokens.color.textSecondary,
    textAlign: 'center',
  },
  track: {
    width: 230,
    height: 18,
    borderRadius: 999,
    marginTop: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.075)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.13)',
  },
  fill: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 0,
    borderRadius: 999,
    backgroundColor: Tokens.color.accent,
  },
  spark: {
    position: 'absolute',
    top: 5,
    left: 34,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    opacity: 0.92,
  },
});
