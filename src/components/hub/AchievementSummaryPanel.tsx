import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tokens } from '../../design-tokens';
import { buildAchievements } from '../../utils/achievement-utils';

interface Props {
  totalViewed: number;
  totalDeleted: number;
  totalFreedBytes: number;
  streakDays: number;
  recentDeleteCount: number;
}

export function AchievementSummaryPanel({
  totalViewed,
  totalDeleted,
  totalFreedBytes,
  streakDays,
  recentDeleteCount,
}: Props) {
  const achievements = buildAchievements({
    totalViewed,
    totalDeleted,
    totalFreedBytes,
    streakDays,
    recentDeleteCount,
  });

  const unlockedCount = achievements.filter((item) => item.unlocked).length;
  const nextAchievement = achievements.find((item) => !item.unlocked) ?? achievements[achievements.length - 1];
  const totalCount = achievements.length;
  const overallProgress = totalCount > 0 ? unlockedCount / totalCount : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.panel}>
        <View style={styles.medal}>
          <View style={styles.medalInner}>
            <Text style={styles.medalNumber}>{unlockedCount}</Text>
            <Text style={styles.medalTotal}>/ {totalCount}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.kickerRow}>
            <MaterialCommunityIcons name={'sparkles' as any} size={14} color={Tokens.color.accent} />
            <Text style={styles.kicker}>成就进度</Text>
          </View>
          <Text style={styles.title}>
            {unlockedCount === totalCount ? '徽章已全部点亮' : `下一枚 · ${nextAchievement.title}`}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {unlockedCount === totalCount
              ? '你的相册清理节奏已经很稳，继续保持这份轻盈。'
              : nextAchievement.description}
          </Text>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${overallProgress * 100}%` }]} />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <MaterialCommunityIcons name="trophy-outline" size={13} color={Tokens.color.accent} />
              <Text style={styles.metaText}>已解锁 {unlockedCount}/{totalCount}</Text>
            </View>
            <View style={styles.metaPill}>
              <MaterialCommunityIcons name="calendar-check" size={13} color={Tokens.color.safe} />
              <Text style={styles.metaText}>连续 {streakDays} 天</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: Tokens.spacing.xl,
  },
  panel: {
    minHeight: 150,
    borderRadius: 30,
    padding: 18,
    flexDirection: 'row',
    gap: 16,
    backgroundColor: Tokens.color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.09)',
    overflow: 'hidden',
  },
  medal: {
    width: 86,
    borderRadius: 28,
    backgroundColor: 'rgba(233,255,63,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(233,255,63,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(233,255,63,0.16)',
  },
  medalNumber: {
    fontSize: 24,
    lineHeight: 27,
    fontWeight: '900',
    color: Tokens.color.accent,
  },
  medalTotal: {
    marginTop: -1,
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.58)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '900',
    color: Tokens.color.accent,
  },
  title: {
    marginTop: 7,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
  },
  subtitle: {
    marginTop: 5,
    minHeight: 36,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: Tokens.color.textMuted,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Tokens.color.accent,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  metaPill: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.34)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.74)',
  },
});
