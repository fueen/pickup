import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PARTICLE_COUNT = 12;
const PARTICLE_COLORS = ['#FFCC00', '#FF3B30', '#34C759', '#007AFF', '#FF9500', '#AF52DE'];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  anim: Animated.Value;
  rotate: Animated.Value;
}

interface Props {
  visible: boolean;
  count: number;
  onDone: () => void;
}

export function CelebrationOverlay({ visible, count, onDone }: Props) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const particles = useRef<Particle[]>([]);

  // Init particles on first render
  if (particles.current.length === 0) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.current.push({
        x: randomBetween(0.1, 0.9) * SCREEN_WIDTH,
        y: randomBetween(0.1, 0.6) * SCREEN_HEIGHT,
        size: randomBetween(4, 10),
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        anim: new Animated.Value(0),
        rotate: new Animated.Value(0),
      });
    }
  }

  useEffect(() => {
    if (!visible) {
      overlayOpacity.setValue(0);
      checkScale.setValue(0);
      textOpacity.setValue(0);
      particles.current.forEach((p) => { p.anim.setValue(0); p.rotate.setValue(0); });
      return;
    }

    // Fade in overlay
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Checkmark pop-in with spring
    Animated.spring(checkScale, {
      toValue: 1,
      damping: 8,
      stiffness: 200,
      useNativeDriver: true,
    }).start();

    // Text fade in (slightly delayed)
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 300,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Particles burst
    const particleAnims = particles.current.map((p) => {
      const targetX = randomBetween(-60, 60);
      const targetY = randomBetween(-80, -20);
      return Animated.parallel([
        Animated.timing(p.anim, {
          toValue: 1,
          duration: randomBetween(600, 900),
          useNativeDriver: true,
        }),
        Animated.timing(p.rotate, {
          toValue: randomBetween(-1, 1),
          duration: randomBetween(600, 900),
          useNativeDriver: true,
        }),
      ]);
    });
    Animated.stagger(30, particleAnims).start();

    // Auto dismiss
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [visible, onDone, overlayOpacity, checkScale, textOpacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: overlayOpacity }]} pointerEvents="none">
      {/* Particles */}
      {particles.current.map((p, i) => {
        const translateX = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, randomBetween(-60, 60)],
        });
        const translateY = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, randomBetween(-100, -30)],
        });
        const opacity = p.anim.interpolate({
          inputRange: [0, 0.6, 1],
          outputRange: [1, 0.8, 0],
        });
        const scale = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.3],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                borderRadius: p.size / 2,
                backgroundColor: p.color,
                transform: [{ translateX }, { translateY }, { scale }],
                opacity,
              },
            ]}
          />
        );
      })}

      {/* Checkmark */}
      <Animated.View style={[styles.checkWrap, { transform: [{ scale: checkScale }] }]}>
        <View style={styles.checkCircle}>
          <MaterialCommunityIcons name="check" size={48} color="#000" />
        </View>
      </Animated.View>

      {/* Text */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.title}>完成！</Text>
        <Text style={styles.sub}>已清理 {count} 张照片</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  particle: {
    position: 'absolute',
  },
  checkWrap: {
    marginBottom: 24,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFCC00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 24,
    shadowOpacity: 0.4,
    elevation: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 4,
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
});
