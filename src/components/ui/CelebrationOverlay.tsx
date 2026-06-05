import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PARTICLE_COUNT = 8;
const PARTICLE_COLORS = ['#FFCC00', '#FF7A90', '#5AD7FF', '#34C759', '#FFB84D'];
const VARIANT_COUNT = 3;
const CANNON_STREAMERS = [
  { side: -1, y: -26, color: '#FFD60A', rotate: '-22deg' },
  { side: -1, y: -4, color: '#FF2D55', rotate: '-9deg' },
  { side: -1, y: 22, color: '#00C7FF', rotate: '12deg' },
  { side: 1, y: -26, color: '#30D158', rotate: '22deg' },
  { side: 1, y: -4, color: '#FF8A00', rotate: '9deg' },
  { side: 1, y: 22, color: '#BF5AF2', rotate: '-12deg' },
];

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
  const [variant, setVariant] = useState(0);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const heroProgress = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const cannonProgress = useRef(new Animated.Value(0)).current;
  const cardProgress = useRef(new Animated.Value(0)).current;
  const particles = useRef<Particle[]>([]);
  const onDoneRef = useRef(onDone);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningAnimationsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  // Init particles on first render
  if (particles.current.length === 0) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.current.push({
        x: randomBetween(0.22, 0.78) * SCREEN_WIDTH,
        y: randomBetween(0.34, 0.55) * SCREEN_HEIGHT,
        size: randomBetween(4, 10),
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        anim: new Animated.Value(0),
        rotate: new Animated.Value(0),
      });
    }
  }

  const title = useMemo(() => {
    if (variant === 1) return '相册轻了一点';
    if (variant === 2) return '这组整理好了';
    return '完成！';
  }, [variant]);

  useEffect(() => {
    const stopRunningAnimations = () => {
      runningAnimationsRef.current.forEach((animation) => animation.stop());
      runningAnimationsRef.current = [];
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };

    if (!visible) {
      stopRunningAnimations();
      overlayOpacity.setValue(0);
      heroProgress.setValue(0);
      textOpacity.setValue(0);
      cannonProgress.setValue(0);
      cardProgress.setValue(0);
      particles.current.forEach((p) => { p.anim.setValue(0); p.rotate.setValue(0); });
      return;
    }

    stopRunningAnimations();
    setVariant(Math.floor(Math.random() * VARIANT_COUNT));
    overlayOpacity.setValue(0);
    heroProgress.setValue(0);
    textOpacity.setValue(0);
    cannonProgress.setValue(0);
    cardProgress.setValue(0);
    particles.current.forEach((p) => { p.anim.setValue(0); p.rotate.setValue(0); });

    const mainAnimation = Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroProgress, {
        toValue: 1,
        duration: 780,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 280,
        delay: 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cannonProgress, {
        toValue: 1,
        duration: 900,
        delay: 80,
        easing: Easing.bezier(0.12, 0.82, 0.18, 1),
        useNativeDriver: true,
      }),
      Animated.timing(cardProgress, {
        toValue: 1,
        duration: 760,
        delay: 80,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
        useNativeDriver: true,
      }),
    ]);
    mainAnimation.start();

    const particleAnims = particles.current.map((p) => {
      return Animated.parallel([
        Animated.timing(p.anim, {
          toValue: 1,
          duration: randomBetween(620, 860),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(p.rotate, {
          toValue: randomBetween(-1, 1),
          duration: randomBetween(620, 860),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
    });
    const particleAnimation = Animated.stagger(18, particleAnims);
    particleAnimation.start();
    runningAnimationsRef.current = [mainAnimation, particleAnimation];

    dismissTimerRef.current = setTimeout(() => {
      const fadeOut = Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      });
      runningAnimationsRef.current = [fadeOut];
      fadeOut.start(({ finished }) => {
        if (finished) onDoneRef.current();
      });
    }, 980);

    return stopRunningAnimations;
  }, [visible, overlayOpacity, heroProgress, textOpacity, cannonProgress, cardProgress]);

  if (!visible) return null;

  const heroScale = heroProgress.interpolate({
    inputRange: [0, 0.72, 1],
    outputRange: [0.86, 1.04, 1],
  });
  const heroOpacity = heroProgress.interpolate({
    inputRange: [0, 0.18, 1],
    outputRange: [0, 1, 1],
  });
  const cannonOpacity = cannonProgress.interpolate({
    inputRange: [0, 0.08, 0.86, 1],
    outputRange: [0, 1, 1, 0.08],
  });
  const cardLift = cardProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [28, -72],
  });
  const cardFade = cardProgress.interpolate({
    inputRange: [0, 0.72, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <Animated.View style={[styles.container, { opacity: overlayOpacity }]} pointerEvents="none">
      {particles.current.map((p, i) => {
        const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + variant * 0.38;
        const radius = variant === 2
          ? 72 + ((i * 17) % 60)
          : 44 + ((i * 13) % 60);
        const translateX = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(angle) * radius],
        });
        const translateY = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(angle) * radius - 36],
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

      {variant === 1 && (
        <Animated.View style={[styles.cardFlight, { opacity: cardFade, transform: [{ translateY: cardLift }] }]}>
          {[0, 1, 2].map((item) => (
            <View
              key={item}
              style={[
                styles.miniCard,
                {
                  transform: [
                    { rotate: `${item === 0 ? -10 : item === 1 ? 6 : 14}deg` },
                    { translateX: item === 0 ? -34 : item === 1 ? 0 : 34 },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>
      )}

      {variant === 2 && (
        <View style={styles.cannonLayer} pointerEvents="none">
          <Animated.View style={[styles.cannonGlow, { opacity: cannonOpacity }]} />
          {CANNON_STREAMERS.map((streamer, index) => {
            const translateX = cannonProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, streamer.side * (132 + index * 12)],
            });
            const translateY = cannonProgress.interpolate({
              inputRange: [0, 0.58, 1],
              outputRange: [0, streamer.y - 72, streamer.y - 124],
            });
            const scaleX = cannonProgress.interpolate({
              inputRange: [0, 0.32, 1],
              outputRange: [0.15, 1.18, 0.92],
            });
            return (
              <Animated.View
                key={`${streamer.side}-${index}`}
                style={[
                  styles.streamer,
                  {
                    backgroundColor: streamer.color,
                    opacity: cannonOpacity,
                    transform: [
                      { translateX },
                      { translateY },
                      { rotate: streamer.rotate },
                      { scaleX },
                    ],
                  },
                ]}
              />
            );
          })}
          {[-1, 1].map((side) => (
            <Animated.View
              key={side}
              style={[
                styles.cannon,
                {
                  opacity: cannonOpacity,
                  transform: [
                    { translateX: side * 58 },
                    { rotate: side < 0 ? '-22deg' : '22deg' },
                    { scale: heroProgress.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons name="party-popper" size={38} color={side < 0 ? '#FFCC00' : '#5AD7FF'} />
            </Animated.View>
          ))}
        </View>
      )}

      <Animated.View style={[styles.heroWrap, { opacity: heroOpacity, transform: [{ scale: heroScale }] }]}>
        {variant === 1 ? (
          <View style={styles.cardCircle}>
            <MaterialCommunityIcons name="image-check-outline" size={46} color="#0B0B0B" />
          </View>
        ) : variant === 2 ? (
          <View style={styles.sparkCircle}>
            <MaterialCommunityIcons name="creation" size={46} color="#0B0B0B" />
          </View>
        ) : (
          <View style={styles.checkCircle}>
            <MaterialCommunityIcons name="check" size={48} color="#000" />
          </View>
        )}
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.title}>{title}</Text>
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
  heroWrap: {
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
  cardCircle: {
    width: 88,
    height: 88,
    borderRadius: 30,
    backgroundColor: '#F8F4E6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFCC00',
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    shadowOpacity: 0.34,
    elevation: 12,
  },
  sparkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFE071',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5AD7FF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 28,
    shadowOpacity: 0.42,
    elevation: 12,
  },
  cannonLayer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.45,
    left: SCREEN_WIDTH / 2,
    width: 1,
    height: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cannon: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streamer: {
    position: 'absolute',
    width: 48,
    height: 7,
    borderRadius: 999,
  },
  cardFlight: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.42,
    left: SCREEN_WIDTH / 2 - 24,
    width: 48,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCard: {
    position: 'absolute',
    width: 44,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#F6F1E3',
    borderWidth: 2,
    borderColor: 'rgba(255,204,0,0.78)',
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
  cannonGlow: {
    position: 'absolute',
    width: 210,
    height: 118,
    borderRadius: 80,
    backgroundColor: 'rgba(255,204,0,0.20)',
  },
});
