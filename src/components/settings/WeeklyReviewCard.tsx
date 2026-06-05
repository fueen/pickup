import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DailyStats } from '../../types/subscription';
import { Tokens } from '../../design-tokens';
import { buildWeeklyReview } from '../../utils/weekly-review-utils';

interface Props {
  weeklyHistory: DailyStats[];
  streakDays: number;
  embedded?: boolean;
}

export function WeeklyReviewCard({ weeklyHistory, streakDays, embedded = false }: Props) {
  const review = buildWeeklyReview(weeklyHistory, streakDays);
  const hasDeletes = review.totalDeleted > 0;

  return (
    <View style={[styles.card, embedded && styles.embeddedCard]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>每周清理回顾</Text>
          <Text style={styles.title}>{review.summary}</Text>
        </View>
        <View style={styles.iconBadge}>
          <MaterialCommunityIcons name="chart-bar" size={22} color={Tokens.color.accent} />
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{review.totalViewed}</Text>
          <Text style={styles.metricLabel}>本周浏览</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: hasDeletes ? Tokens.color.danger : Tokens.color.textPrimary }]}>
            {review.totalDeleted}
          </Text>
          <Text style={styles.metricLabel}>本周删除</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: Tokens.color.safe }]}>{review.streakDays}</Text>
          <Text style={styles.metricLabel}>连续天数</Text>
        </View>
      </View>

      <View style={styles.barsRow}>
        {review.days.length === 0 ? (
          <Text style={styles.emptyText}>整理一组照片后，这里会生成你的周回顾</Text>
        ) : (
          review.days.map((day) => (
            <View key={day.date} style={styles.barSlot}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${Math.max(12, day.intensity * 100)}%` },
                    day.deleted === 0 && styles.barFillEmpty,
                  ]}
                />
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: Tokens.spacing.l,
    padding: 18,
    borderRadius: 28,
    backgroundColor: Tokens.color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  embeddedCard: {
    marginHorizontal: 0,
    marginBottom: 0,
    backgroundColor: Tokens.color.surface,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Tokens.spacing.m,
    marginBottom: Tokens.spacing.l,
  },
  eyebrow: {
    fontSize: 13,
    lineHeight: 16,
    color: Tokens.color.accent,
    fontWeight: '900',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
  },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(233,255,63,0.13)',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Tokens.spacing.s,
    marginBottom: Tokens.spacing.l,
  },
  metric: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.055)',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
  },
  metricLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: Tokens.color.textMuted,
  },
  barsRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7,
  },
  barSlot: {
    flex: 1,
    height: 54,
    justifyContent: 'flex-end',
  },
  barTrack: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: Tokens.color.accent,
  },
  barFillEmpty: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  emptyText: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
  },
});
