import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSubscriptionContext } from '../../contexts/SubscriptionContext';
import { Tokens } from '../../design-tokens';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function LimitReachedModal({ visible, onClose }: Props) {
  const router = useRouter();
  const { todayGroupCount } = useSubscriptionContext();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handle} />

          <Text style={styles.title}>今日次数已用完</Text>
          <Text style={styles.subtitle}>
            免费用户每天可浏览 {Tokens.photo.freeDailyLimit} 组照片
          </Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{todayGroupCount}</Text>
              <Text style={styles.statLabel}>今日已浏览</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{Tokens.photo.freeDailyLimit}</Text>
              <Text style={styles.statLabel}>每日上限</Text>
            </View>
          </View>

          {/* Upgrade CTA */}
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => {
              onClose();
              router.push('/paywall');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeText}>升级 Pro 无限使用</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.laterButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.laterText}>明天再来</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Tokens.color.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Tokens.color.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Tokens.spacing.m,
    paddingBottom: 50,
    paddingHorizontal: Tokens.spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Tokens.color.textMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Tokens.spacing.l,
  },
  title: {
    ...Tokens.typography.title,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.s,
  },
  subtitle: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Tokens.spacing.xl,
    marginBottom: Tokens.spacing.xl,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
    fontSize: 40,
  },
  statLabel: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
  },
  upgradeButton: {
    backgroundColor: Tokens.color.safe,
    borderRadius: Tokens.radius.button,
    paddingVertical: Tokens.spacing.l,
    alignItems: 'center',
    marginBottom: Tokens.spacing.m,
  },
  upgradeText: {
    ...Tokens.typography.body,
    color: '#000000',
    fontWeight: '700',
    fontSize: 18,
  },
  laterButton: {
    paddingVertical: Tokens.spacing.m,
    alignItems: 'center',
  },
  laterText: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
  },
});
