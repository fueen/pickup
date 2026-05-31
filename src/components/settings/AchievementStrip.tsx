import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tokens } from '../../design-tokens';
import { buildAchievements } from '../../utils/achievement-utils';

interface Props {
  totalViewed: number;
  totalDeleted: number;
  totalFreedBytes: number;
  streakDays: number;
  recentDeleteCount: number;
  embedded?: boolean;
}

export function AchievementStrip({
  totalViewed,
  totalDeleted,
  totalFreedBytes,
  streakDays,
  recentDeleteCount,
  embedded = false,
}: Props) {
  const achievements = buildAchievements({
    totalViewed,
    totalDeleted,
    totalFreedBytes,
    streakDays,
    recentDeleteCount,
  });

  return (
    <View style={[styles.section, embedded && styles.embeddedSection]}>
      <View style={[styles.header, embedded && styles.embeddedHeader]}>
        <Text style={styles.title}>清理成就</Text>
        <Text style={styles.subtitle}>完成整理后，徽章会在这里逐步点亮</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.list, embedded && styles.embeddedList]}
      >
        {achievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.badge,
              achievement.unlocked && {
                borderColor: achievement.color,
                backgroundColor: `${achievement.color}16`,
              },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: achievement.unlocked ? `${achievement.color}24` : 'rgba(255,255,255,0.06)' },
              ]}
            >
              <MaterialCommunityIcons
                name={achievement.icon as any}
                size={23}
                color={achievement.unlocked ? achievement.color : Tokens.color.textMuted}
              />
            </View>
            <Text style={[styles.badgeTitle, achievement.unlocked && { color: achievement.color }]}>
              {achievement.title}
            </Text>
            <Text style={styles.badgeDescription} numberOfLines={2}>
              {achievement.description}
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${achievement.progress * 100}%`, backgroundColor: achievement.color },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{achievement.progressText}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Tokens.spacing.l,
  },
  embeddedSection: {
    marginBottom: 0,
  },
  header: {
    paddingHorizontal: Tokens.spacing.l,
    marginBottom: Tokens.spacing.m,
  },
  embeddedHeader: {
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Tokens.color.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: Tokens.color.textSecondary,
  },
  list: {
    paddingHorizontal: Tokens.spacing.l,
    gap: Tokens.spacing.m,
  },
  embeddedList: {
    paddingHorizontal: 0,
    paddingRight: Tokens.spacing.s,
  },
  badge: {
    width: 132,
    padding: Tokens.spacing.m,
    borderRadius: 16,
    backgroundColor: Tokens.color.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Tokens.spacing.m,
  },
  badgeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Tokens.color.textPrimary,
    marginBottom: 4,
  },
  badgeDescription: {
    minHeight: 34,
    fontSize: 11,
    lineHeight: 17,
    color: Tokens.color.textSecondary,
  },
  progressTrack: {
    height: 5,
    marginTop: Tokens.spacing.m,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressText: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: '700',
    color: Tokens.color.textSecondary,
  },
});
