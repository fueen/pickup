import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface Props {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: Props) {
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(8)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1, duration: 800, useNativeDriver: true,
        }),
        Animated.timing(titleTranslate, {
          toValue: 0, duration: 800, useNativeDriver: true,
        }),
      ]),
      Animated.timing(sloganOpacity, {
        toValue: 1, duration: 600, useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onFinish, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: titleOpacity,
          transform: [{ translateY: titleTranslate }],
        }}
      >
        <Text style={styles.title}>PICKUP</Text>
      </Animated.View>
      <Animated.View style={{ opacity: sloganOpacity, marginTop: 20 }}>
        <Text style={styles.slogan}>整理你的生活</Text>
      </Animated.View>
      <View style={styles.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'serif',
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 8,
    textAlign: 'center',
  },
  slogan: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '300',
    color: '#8E8E93',
    letterSpacing: 4,
    textAlign: 'center',
  },
  dot: {
    marginTop: 32,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFCC00',
    opacity: 0.5,
  },
});
