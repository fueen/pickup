import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeBlurView } from '../ui/SafeBlurView';
import Animated, {
  useAnimatedStyle, useSharedValue, withTiming, runOnJS,
} from 'react-native-reanimated';
import { Tokens } from '../../design-tokens';
import { SortMode } from '../../types/photo';

interface SortOption {
  key: SortMode;
  label: string;
  icon: string;
}

const SORT_OPTIONS: SortOption[] = [
  { key: 'random', label: '随机', icon: 'shuffle-variant' },
  { key: 'sizeDesc', label: '面积从大到小', icon: 'aspect-ratio' },
  { key: 'timeNewest', label: '时间从新到旧', icon: 'sort-clock-descending-outline' },
  { key: 'timeOldest', label: '时间从旧到新', icon: 'sort-clock-ascending-outline' },
];

interface Props {
  visible: boolean;
  selected: SortMode;
  onSelect: (mode: SortMode) => void;
  onClose: () => void;
}

export function SortPickerSheet({ visible, selected, onSelect, onClose }: Props) {
  const [render, setRender] = useState(false);
  const overlayOpacity = useSharedValue(0);
  const translateY = useSharedValue(300);
  const prevVisible = useRef(false);

  useEffect(() => {
    if (visible === prevVisible.current) return;
    prevVisible.current = visible;

    if (visible) {
      setRender(true);
      overlayOpacity.value = withTiming(1, { duration: 280 });
      translateY.value = withTiming(0, { duration: 350 });
    } else if (render) {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(300, { duration: 250 }, () => {
        runOnJS(setRender)(false);
      });
    }
  }, [visible, render]);

  const handleSelect = (mode: SortMode) => {
    onSelect(mode);
  };

  const overlayAnimated = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const sheetAnimated = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!render) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, overlayAnimated]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.sheet, sheetAnimated]}>
          <SafeBlurView
            style={StyleSheet.absoluteFill}
            tint="dark"
            intensity={90}
            fallbackBackground="rgba(28,28,30,0.95)"
          />
          <View style={styles.handle} />
          <Text style={styles.title}>排序方式</Text>

          {SORT_OPTIONS.map((opt) => {
            const isActive = selected === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.option, isActive && styles.optionActive]}
                onPress={() => handleSelect(opt.key)}
                activeOpacity={0.6}
              >
                <MaterialCommunityIcons
                  name={opt.icon as any}
                  size={20}
                  color={isActive ? Tokens.color.accent : Tokens.color.textSecondary}
                />
                <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>
                  {opt.label}
                </Text>
                {isActive && (
                  <MaterialCommunityIcons name="check" size={20} color={Tokens.color.accent} />
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.6}>
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    paddingBottom: 40,
    borderTopWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    ...Tokens.typography.title,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 15,
    paddingHorizontal: Tokens.spacing.xl,
    marginHorizontal: Tokens.spacing.m,
    borderRadius: Tokens.radius.card,
  },
  optionActive: {
    backgroundColor: 'rgba(255,204,0,0.08)',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: Tokens.color.textPrimary,
  },
  optionLabelActive: {
    color: Tokens.color.accent,
    fontWeight: '600',
  },
  cancelBtn: {
    marginTop: 12,
    marginHorizontal: Tokens.spacing.m,
    paddingVertical: 14,
    borderRadius: Tokens.radius.button,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Tokens.color.textSecondary,
  },
});
