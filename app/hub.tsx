import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, ScrollView } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { MonthlyChart } from '../src/components/hub/MonthlyChart';
import { WeeklyReviewCard } from '../src/components/settings/WeeklyReviewCard';
import { AchievementStrip } from '../src/components/settings/AchievementStrip';
import { useStatsContext } from '../src/contexts/StatsContext';
import { getValidRecentDeletes } from '../src/services/stats-service';
import { Tokens } from '../src/design-tokens';

interface MonthData {
  month: string;
  count: number;
  isCurrent: boolean;
}

const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'];

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}

export default function HubScreen() {
  const router = useRouter();
  const { totalViewed, totalDeleted, totalFreedBytes, streakDays, weeklyHistory } = useStatsContext();
  const [chartData, setChartData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [recentDeleteCount, setRecentDeleteCount] = useState(0);

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const yearlyDataRef = useRef<Record<number, Record<number, number>>>({});
  const availableYearsRef = useRef<number[]>([]);

  useFocusEffect(React.useCallback(() => {
    let active = true;
    getValidRecentDeletes()
      .then((records) => {
        if (active) setRecentDeleteCount(records.length);
      })
      .catch(() => {
        if (active) setRecentDeleteCount(0);
      });
    return () => {
      active = false;
    };
  }, []));

  useEffect(() => {
    (async () => {
      try {
        const yearlyData: Record<number, Record<number, number>> = {};
        let cursor: string | undefined;
        let hasMore = true;

        while (hasMore) {
          const page = await MediaLibrary.getAssetsAsync({
            mediaType: ['photo'],
            first: 500,
            after: cursor,
          });
          for (const asset of page.assets) {
            if (asset.creationTime) {
              const d = new Date(asset.creationTime);
              const year = d.getFullYear();
              const monthIdx = d.getMonth();
              if (!yearlyData[year]) yearlyData[year] = {};
              yearlyData[year][monthIdx] = (yearlyData[year][monthIdx] || 0) + 1;
            }
          }
          hasMore = page.hasNextPage;
          cursor = page.endCursor;
        }

        const years = Object.keys(yearlyData).map(Number).sort((a, b) => b - a);
        yearlyDataRef.current = yearlyData;
        availableYearsRef.current = years;

        const currentYear = new Date().getFullYear();
        const defaultYear = years.includes(currentYear) ? currentYear : (years[0] ?? currentYear);

        // Compute total count across all years
        let total = 0;
        for (const y of years) {
          const months = yearlyData[y];
          total += Object.values(months).reduce((a, b) => a + b, 0);
        }
        setTotalCount(total);

        // Set chart data for the default year
        const yearData = yearlyData[defaultYear] || {};
        const data: MonthData[] = MONTH_LABELS.map((month, i) => ({
          month,
          count: yearData[i] || 0,
          isCurrent: i === new Date().getMonth() && defaultYear === new Date().getFullYear(),
        }));
        setChartData(data);
        setSelectedYear(defaultYear);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  // Update chart data when year changes
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setShowYearPicker(false);
    const yearData = yearlyDataRef.current[year] || {};
    const data: MonthData[] = MONTH_LABELS.map((month, i) => ({
      month,
      count: yearData[i] || 0,
      isCurrent: i === new Date().getMonth() && year === new Date().getFullYear(),
    }));
    setChartData(data);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>更多功能</Text>
        <Text style={styles.subtitle}>把清理照片变成看得见的成果 · 共 {totalCount} 张照片</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalDeleted}</Text>
            <Text style={styles.summaryLabel}>累计清理</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Tokens.color.safe }]}>{streakDays}</Text>
            <Text style={styles.summaryLabel}>连续天数</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Tokens.color.accent }]}>{formatBytes(totalFreedBytes)}</Text>
            <Text style={styles.summaryLabel}>释放空间</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>月份分析</Text>
          <Text style={styles.sectionSubtitle}>看看哪些月份占用了最多记忆空间</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={Tokens.color.accent} style={{ marginTop: 40 }} />
        ) : (
          <>
            <TouchableOpacity style={styles.yearBtn} onPress={() => setShowYearPicker(true)} activeOpacity={0.7}>
              <Text style={styles.yearText}>{selectedYear} 年</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={Tokens.color.accent} />
            </TouchableOpacity>

            <Modal visible={showYearPicker} transparent animationType="fade">
              <TouchableOpacity style={styles.yearOverlay} activeOpacity={1} onPress={() => setShowYearPicker(false)}>
                <View style={styles.yearList}>
                  {availableYearsRef.current.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[styles.yearOption, year === selectedYear && styles.yearOptionActive]}
                      onPress={() => handleYearChange(year)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.yearOptionText, year === selectedYear && styles.yearOptionTextActive]}>
                        {year} 年
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>

            <MonthlyChart data={chartData} />
          </>
        )}

        <View style={styles.sectionSpacing}>
          <WeeklyReviewCard weeklyHistory={weeklyHistory} streakDays={streakDays} />
        </View>

        <AchievementStrip
          totalViewed={totalViewed}
          totalDeleted={totalDeleted}
          totalFreedBytes={totalFreedBytes}
          streakDays={streakDays}
          recentDeleteCount={recentDeleteCount}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>功能入口</Text>
          <Text style={styles.sectionSubtitle}>更多清理工具会在这里逐步开放</Text>
        </View>

        <View style={styles.featureGrid}>
          <TouchableOpacity
            style={styles.featureTile}
            onPress={() => router.push('/recent-deletes')}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons name="delete-clock-outline" size={24} color={Tokens.color.danger} />
            <Text style={styles.featureTitle}>最近删除</Text>
            <Text style={styles.featureSubtitle}>{recentDeleteCount} 张记录</Text>
          </TouchableOpacity>

          <View style={styles.featureTile}>
            <MaterialCommunityIcons name="image-filter-center-focus" size={24} color={Tokens.color.accent} />
            <Text style={styles.featureTitle}>相册洞察</Text>
            <Text style={styles.featureSubtitle}>即将开放</Text>
          </View>

          <View style={styles.featureTile}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={Tokens.color.safe} />
            <Text style={styles.featureTitle}>清理提醒</Text>
            <Text style={styles.featureSubtitle}>即将开放</Text>
          </View>

          <View style={styles.featureTile}>
            <MaterialCommunityIcons name="file-chart-outline" size={24} color="#64D2FF" />
            <Text style={styles.featureTitle}>导出报告</Text>
            <Text style={styles.featureSubtitle}>即将开放</Text>
          </View>
        </View>

        <View style={{ height: 96 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background },
  scrollContent: { paddingTop: 60 },
  title: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
    letterSpacing: 4,
  },
  subtitle: {
    ...Tokens.typography.caption,
    color: Tokens.color.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Tokens.spacing.m,
    paddingHorizontal: Tokens.spacing.l,
    marginTop: 22,
    marginBottom: 28,
  },
  summaryItem: {
    flex: 1,
    minHeight: 74,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Tokens.spacing.s,
  },
  summaryValue: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
    textAlign: 'center',
  },
  summaryLabel: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: '700',
    color: Tokens.color.textSecondary,
  },
  sectionHeader: {
    paddingHorizontal: Tokens.spacing.l,
    marginTop: Tokens.spacing.s,
    marginBottom: Tokens.spacing.m,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
  },
  sectionSubtitle: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: Tokens.color.textSecondary,
  },
  yearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Tokens.color.surface,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 20,
    alignSelf: 'center',
    gap: 6,
  },
  yearText: { fontSize: 15, fontWeight: '600', color: Tokens.color.textPrimary },
  yearOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  yearList: { backgroundColor: Tokens.color.surface, borderRadius: 16, padding: 8, minWidth: 160 },
  yearOption: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center' },
  yearOptionActive: { backgroundColor: 'rgba(255,204,0,0.15)' },
  yearOptionText: { fontSize: 16, color: Tokens.color.textSecondary },
  yearOptionTextActive: { fontSize: 16, color: Tokens.color.accent, fontWeight: '700' },
  sectionSpacing: {
    marginTop: Tokens.spacing.xl,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Tokens.spacing.m,
    paddingHorizontal: Tokens.spacing.l,
  },
  featureTile: {
    width: '48%',
    minHeight: 104,
    borderRadius: 16,
    padding: Tokens.spacing.l,
    backgroundColor: Tokens.color.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  featureTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
  },
  featureSubtitle: {
    marginTop: 5,
    fontSize: 12,
    color: Tokens.color.textSecondary,
  },
});
