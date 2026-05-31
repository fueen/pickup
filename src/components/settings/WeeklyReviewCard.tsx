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
    marginHorizontal: Tokens.spacing.l,
    marginBottom: Tokens.spacing.l,
    padding: Tokens.spacing.l,
    borderRadius: 18,
    backgroundColor: Tokens.color.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  embeddedCard: {
    marginHorizontal: 0,
    marginBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: 'rgba(255,255,255,0.075)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Tokens.spacing.m,
    marginBottom: Tokens.spacing.l,
  },
  eyebrow: {
    ...Tokens.typography.caption,
    color: Tokens.color.accent,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: Tokens.color.textPrimary,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,204,0,0.12)',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Tokens.spacing.s,
    marginBottom: Tokens.spacing.l,
  },
  metric: {
    flex: 1,
    paddingVertical: Tokens.spacing.m,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
  },
  metricLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: Tokens.color.textSecondary,
  },
  barsRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7,
  },
  barSlot: {
    flex: 1,
    height: 48,
    justifyContent: 'flex-end',
  },
  barTrack: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: Tokens.color.accent,
  },
  barFillEmpty: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  emptyText: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
  },
});
