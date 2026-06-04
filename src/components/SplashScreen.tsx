import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface Props {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: Props) {
  const cardOne = useRef(new Animated.Value(0)).current;
  const cardTwo = useRef(new Animated.Value(0)).current;
  const cardThree = useRef(new Animated.Value(0)).current;
  const letterP = useRef(new Animated.Value(0)).current;
  const letterI = useRef(new Animated.Value(0)).current;
  const letterC = useRef(new Animated.Value(0)).current;
  const letterK = useRef(new Animated.Value(0)).current;
  const letterU = useRef(new Animated.Value(0)).current;
  const letterP2 = useRef(new Animated.Value(0)).current;
  const dotPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const letterValues = [letterP, letterI, letterC, letterK, letterU, letterP2];
    const cardAnimations = [
      Animated.spring(cardOne, {
        toValue: 1,
        tension: 36,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(cardTwo, {
        toValue: 1,
        tension: 42,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.spring(cardThree, {
        toValue: 1,
        tension: 38,
        friction: 8,
        useNativeDriver: true,
      }),
    ];

    Animated.parallel([
      Animated.stagger(90, cardAnimations),
      Animated.sequence([
        Animated.delay(260),
        Animated.stagger(
          55,
          letterValues.map((value) =>
            Animated.spring(value, {
              toValue: 1,
              tension: 50,
              friction: 9,
              useNativeDriver: true,
            }),
          ),
        ),
      ]),
    ]).start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, {
          toValue: 1,
          duration: 620,
          useNativeDriver: true,
        }),
        Animated.timing(dotPulse, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseAnimation.start();

    const timer = setTimeout(onFinish, 2600);
    return () => {
      clearTimeout(timer);
      pulseAnimation.stop();
    };
  }, []);

  const letters = [
    { char: 'P', value: letterP, offset: -10 },
    { char: 'I', value: letterI, offset: 7 },
    { char: 'C', value: letterC, offset: -5 },
    { char: 'K', value: letterK, offset: 9 },
    { char: 'U', value: letterU, offset: -7 },
    { char: 'P', value: letterP2, offset: 5 },
  ];

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.cardStage}>
        <Animated.View style={[styles.brandCard, styles.cardOne, cardStyle(cardOne, -26, 18, '-15deg', 0.5)]} />
        <Animated.View style={[styles.brandCard, styles.cardTwo, cardStyle(cardTwo, 22, -16, '10deg', 0.7)]} />
        <Animated.View style={[styles.brandCard, styles.cardThree, cardStyle(cardThree, -8, -24, '-4deg', 1)]} />
      </View>

      <Animated.View style={styles.titleRow}>
        {letters.map((letter, index) => (
          <Animated.Text
            key={`${letter.char}-${index}`}
            style={[
              styles.titleLetter,
              {
                opacity: letter.value,
                transform: [
                  {
                    translateY: letter.value.interpolate({
                      inputRange: [0, 1],
                      outputRange: [letter.offset, 0],
                    }),
                  },
                  {
                    scale: letter.value.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {letter.char}
          </Animated.Text>
        ))}
      </Animated.View>

      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dotPulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.35, 0.85],
            }),
            transform: [
              {
                scale: dotPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.88, 1.25],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
}

function cardStyle(value: Animated.Value, x: number, y: number, rotate: string, finalOpacity: number) {
  return {
    opacity: value.interpolate({
      inputRange: [0, 1],
      outputRange: [0, finalOpacity],
    }),
    transform: [
      {
        translateX: value.interpolate({
          inputRange: [0, 1],
          outputRange: [x, 0],
        }),
      },
      {
        translateY: value.interpolate({
          inputRange: [0, 1],
          outputRange: [y, 0],
        }),
      },
      {
        scale: value.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1],
        }),
      },
      { rotate },
    ],
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardStage: {
    width: 180,
    height: 138,
    position: 'absolute',
    top: '34%',
  },
  brandCard: {
    position: 'absolute',
    width: 92,
    height: 118,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFCC00',
    backgroundColor: '#151515',
  },
  cardOne: {
    left: 10,
    top: 18,
    opacity: 0.5,
  },
  cardTwo: {
    right: 6,
    top: 4,
    opacity: 0.65,
  },
  cardThree: {
    left: 56,
    top: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginTop: 42,
  },
  titleLetter: {
    fontFamily: 'serif',
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
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
