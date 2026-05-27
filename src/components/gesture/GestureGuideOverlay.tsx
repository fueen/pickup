import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableWithoutFeedback } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export function GestureGuideOverlay({ visible, onDismiss }: Props) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(overlayOpacity, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }).start();

      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    } else {
      overlayOpacity.setValue(0);
    }
  }, [visible, onDismiss, overlayOpacity]);

  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <Animated.View style={[styles.container, { opacity: overlayOpacity }]}>
        <View style={styles.overlay}>
          {/* ── Top toolbar hints ── */}
          <View style={styles.toolbarHintLeft}>
            <MaterialCommunityIcons name="sort-variant" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.toolbarHintText}>排序</Text>
          </View>

          <View style={styles.toolbarHintRight}>
            <MaterialCommunityIcons name="delete-outline" size={14} color="rgba(255,255,255,0.6)" />
            <View style={styles.miniBadge}>
              <Text style={styles.miniBadgeText}>3</Text>
            </View>
            <Text style={styles.toolbarHintText}>批量删除</Text>
          </View>

          {/* ── Swipe gestures ── */}

          {/* UP: mark delete */}
          <View style={[styles.gestureGroup, styles.up]}>
            <View style={[styles.ring, styles.ringDanger]}>
              <Text style={styles.arrowEmoji}>👆</Text>
            </View>
            <Text style={styles.gestureLabel}>上滑 · 标记删除</Text>
          </View>

          {/* DOWN: mark keep */}
          <View style={[styles.gestureGroup, styles.down]}>
            <View style={[styles.ring, styles.ringKeep]}>
              <Text style={styles.arrowEmoji}>👇</Text>
            </View>
            <Text style={styles.gestureLabel}>下滑 · 标记保留</Text>
          </View>

          {/* LEFT: skip */}
          <View style={[styles.gestureGroup, styles.left]}>
            <View style={[styles.ring, styles.ringNav]}>
              <Text style={styles.arrowEmoji}>👈</Text>
            </View>
            <Text style={styles.gestureLabel}>左滑 · 跳过</Text>
          </View>

          {/* RIGHT: previous */}
          <View style={[styles.gestureGroup, styles.right]}>
            <View style={[styles.ring, styles.ringNav]}>
              <Text style={styles.arrowEmoji}>👉</Text>
            </View>
            <Text style={styles.gestureLabel}>右滑 · 上一张</Text>
          </View>

          {/* ── Center message ── */}
          <View style={styles.centerMessage}>
            <Text style={styles.centerTitle}>每 10 张一组</Text>
            <Text style={styles.centerSub}>上滑删除 · 下滑保留 · 整理后确认</Text>
          </View>

          {/* ── Bottom toolbar hints ── */}
          <View style={styles.bottomHintLeft}>
            <MaterialCommunityIcons name="layers" size={16} color="rgba(255,255,255,0.5)" />
            <Text style={styles.bottomHintText}>切换相册</Text>
          </View>

          <View style={styles.bottomHintRight}>
            <MaterialCommunityIcons name="information-outline" size={16} color="rgba(255,255,255,0.5)" />
            <Text style={styles.bottomHintText}>照片详情</Text>
          </View>

          {/* ── Progress dots hint ── */}
          <View style={styles.dotsHint}>
            <View style={styles.demoDots}>
              {[0, 1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.demoDot,
                    i === 0 && styles.demoDotDelete,
                    i === 2 && styles.demoDotKeep,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.dotsHintText}>点击圆点跳转 · 黄=已删 绿=已留</Text>
          </View>

          {/* ── Dismiss ── */}
          <Text style={styles.dismissText}>点击任意位置关闭</Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const RING_SIZE = 52;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Toolbar hints ──
  toolbarHintLeft: {
    position: 'absolute',
    top: 58,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toolbarHintRight: {
    position: 'absolute',
    top: 58,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toolbarHintText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  miniBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },

  // ── Gesture groups ──
  gestureGroup: {
    position: 'absolute',
    alignItems: 'center',
    gap: 8,
  },
  up: { top: 120, left: 0, right: 0 },
  down: { bottom: 220, left: 0, right: 0 },
  left: { left: 28, top: '50%', marginTop: -50 },
  right: { right: 28, top: '50%', marginTop: -50 },

  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDanger: {
    backgroundColor: 'rgba(255,59,48,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,59,48,0.35)',
  },
  ringKeep: {
    backgroundColor: 'rgba(52,199,89,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(52,199,89,0.3)',
  },
  ringNav: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  arrowEmoji: {
    fontSize: 24,
  },
  gestureLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // ── Center message ──
  centerMessage: {
    position: 'absolute',
    top: '50%',
    marginTop: -30,
    alignItems: 'center',
  },
  centerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
  },
  centerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 6,
    letterSpacing: 1,
  },

  // ── Bottom corner hints ──
  bottomHintLeft: {
    position: 'absolute',
    bottom: 110,
    left: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bottomHintRight: {
    position: 'absolute',
    bottom: 110,
    right: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bottomHintText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },

  // ── Progress dots ──
  dotsHint: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    gap: 6,
  },
  demoDots: {
    flexDirection: 'row',
    gap: 6,
  },
  demoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  demoDotDelete: {
    backgroundColor: '#FFCC00',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  demoDotKeep: {
    backgroundColor: '#34C759',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotsHintText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.5,
  },

  // ── Dismiss ──
  dismissText: {
    position: 'absolute',
    bottom: 16,
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 1,
  },
});
