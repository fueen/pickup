import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tokens } from '../../design-tokens';

interface GuidePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function GuidePreviewModal({ visible, onClose, onStart }: GuidePreviewModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>快速上手</Text>
              <Text style={styles.subtitle}>像刷照片一样整理相册</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <MaterialCommunityIcons name="close" size={20} color={Tokens.color.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.preview}>
            <View style={[styles.gestureChip, styles.deleteChip]}>
              <MaterialCommunityIcons name="arrow-up" size={15} color="#fff" />
              <Text style={styles.chipText}>删除</Text>
            </View>
            <View style={[styles.gestureChip, styles.keepChip]}>
              <MaterialCommunityIcons name="arrow-down" size={15} color="#fff" />
              <Text style={styles.chipText}>保留</Text>
            </View>
            <View style={[styles.sideHint, styles.leftHint]}>
              <MaterialCommunityIcons name="arrow-left" size={18} color={Tokens.color.textSecondary} />
              <Text style={styles.sideText}>跳过</Text>
            </View>
            <View style={[styles.sideHint, styles.rightHint]}>
              <Text style={styles.sideText}>上一张</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={Tokens.color.textSecondary} />
            </View>

            <View style={styles.photoCard}>
              <View style={styles.photoGlow} />
              <MaterialCommunityIcons name="image-multiple" size={44} color="rgba(255,255,255,0.70)" />
              <View style={styles.photoLine} />
              <View style={[styles.photoLine, styles.shortLine]} />
            </View>

            <View style={styles.progressDots}>
              {Array.from({ length: 10 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === 0 && { backgroundColor: Tokens.color.accent },
                    index === 1 && { backgroundColor: Tokens.color.safe },
                    index > 1 && { backgroundColor: 'rgba(255,255,255,0.16)' },
                  ]}
                />
              ))}
            </View>
          </View>

          <Text style={styles.summary}>上滑删除 · 下滑保留 · 左滑跳过 · 右滑上一张</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} activeOpacity={0.75}>
              <Text style={styles.secondaryText}>我知道了</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={onStart} activeOpacity={0.82}>
              <Text style={styles.primaryText}>开始整理</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  card: {
    borderRadius: 28,
    backgroundColor: '#151516',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: Tokens.color.textSecondary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  preview: {
    height: 300,
    marginTop: 22,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#070707',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCard: {
    width: 154,
    height: 214,
    borderRadius: 28,
    backgroundColor: '#252527',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoGlow: {
    position: 'absolute',
    top: 18,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,204,0,0.18)',
  },
  photoLine: {
    width: 78,
    height: 6,
    borderRadius: 3,
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  shortLine: {
    width: 48,
    marginTop: 8,
  },
  gestureChip: {
    position: 'absolute',
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
  },
  deleteChip: {
    top: 18,
    backgroundColor: 'rgba(255,59,48,0.88)',
  },
  keepChip: {
    bottom: 42,
    backgroundColor: 'rgba(52,199,89,0.88)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  sideHint: {
    position: 'absolute',
    zIndex: 2,
    top: 132,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leftHint: { left: 18 },
  rightHint: { right: 18 },
  sideText: {
    fontSize: 12,
    fontWeight: '700',
    color: Tokens.color.textSecondary,
  },
  progressDots: {
    position: 'absolute',
    bottom: 18,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  summary: {
    marginTop: 16,
    fontSize: 13,
    lineHeight: 19,
    color: Tokens.color.textSecondary,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  primaryBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Tokens.color.accent,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: Tokens.color.textPrimary,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
  },
});
