import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { HubLoadingProgress } from '../src/components/hub/HubLoadingProgress';
import { MonthlyChart } from '../src/components/hub/MonthlyChart';
import { PawMark } from '../src/components/hub/PawMark';
import { AchievementSummaryPanel } from '../src/components/hub/AchievementSummaryPanel';
import { WeeklyReviewCard } from '../src/components/settings/WeeklyReviewCard';
import { StatCard } from '../src/components/settings/StatCard';
import { useStatsContext } from '../src/contexts/StatsContext';
import { usePhotoContext } from '../src/contexts/PhotoContext';
import { getValidRecentDeletes } from '../src/services/stats-service';
import { Toast } from '../src/components/ui/Toast';
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
  const { setMonthScope } = usePhotoContext();
  const [chartData, setChartData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [recentDeleteCount, setRecentDeleteCount] = useState(0);

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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

  const handleMonthPress = (monthIndex: number, item: MonthData) => {
    if (item.count <= 0) {
      setToastMsg('这个月份还没有照片');
      return;
    }

    const scope = {
      year: selectedYear,
      monthIndex,
      label: `${selectedYear}年${monthIndex + 1}月`,
    };
    setMonthScope(scope);
    router.push('/');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <HubLoadingProgress />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>月份分析</Text>
          <Text style={styles.sectionSubtitle}>共 {totalCount} 张照片，点击月份直接整理那个月的记忆</Text>
        </View>

        <View style={styles.monthPanel}>
          <View style={styles.monthPanelTop}>
            <TouchableOpacity style={styles.yearBtn} onPress={() => setShowYearPicker(true)} activeOpacity={0.7}>
              <Text style={styles.yearText}>{selectedYear} 年</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={Tokens.color.accent} />
            </TouchableOpacity>
            <PawMark />
          </View>

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

          <MonthlyChart data={chartData} onMonthPress={handleMonthPress} />
        </View>

        <View style={styles.statsSection}>
          <View style={styles.sectionHeaderCompact}>
            <Text style={styles.sectionTitle}>统计概览</Text>
            <Text style={styles.sectionSubtitle}>清理成果会在这里持续累积</Text>
          </View>
          <View style={styles.statsGrid}>
            <StatCard label="已浏览" value={totalViewed} valueColor={Tokens.color.textPrimary} />
            <StatCard label="最近删除" value={recentDeleteCount} valueColor={Tokens.color.danger} />
          </View>
          <View style={styles.statsGrid}>
            <StatCard label="连续天数" value={streakDays} unit="天" valueColor={Tokens.color.safe} />
            <StatCard label="释放空间" value={formatBytes(totalFreedBytes)} valueColor={Tokens.color.accent} />
          </View>
        </View>

        <View style={styles.sectionSpacing}>
          <WeeklyReviewCard weeklyHistory={weeklyHistory} streakDays={streakDays} />
        </View>

        <AchievementSummaryPanel
          totalViewed={totalViewed}
          totalDeleted={totalDeleted}
          totalFreedBytes={totalFreedBytes}
          streakDays={streakDays}
          recentDeleteCount={recentDeleteCount}
        />

        {/* v2.0: 功能入口卡片暂时隐藏，后续统一评估是否回到 Hub。 */}

        <View style={{ height: 96 }} />
      </ScrollView>
      <Toast
        visible={toastMsg !== null}
        message={toastMsg ?? ''}
        onDismiss={() => setToastMsg(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background },
  scrollContent: { paddingTop: 72 },
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
    paddingHorizontal: 32,
    marginTop: Tokens.spacing.s,
    marginBottom: 18,
  },
  sectionHeaderCompact: {
    paddingHorizontal: 32,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
  },
  sectionSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '900',
    color: Tokens.color.textMuted,
  },
  yearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.075)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 11,
    alignSelf: 'flex-start',
    minHeight: 44,
    gap: 6,
  },
  yearText: { fontSize: 17, fontWeight: '900', color: Tokens.color.textPrimary },
  yearOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  yearList: { backgroundColor: Tokens.color.surface, borderRadius: 16, padding: 8, minWidth: 160 },
  yearOption: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center' },
  yearOptionActive: { backgroundColor: 'rgba(255,204,0,0.15)' },
  yearOptionText: { fontSize: 16, color: Tokens.color.textSecondary },
  yearOptionTextActive: { fontSize: 16, color: Tokens.color.accent, fontWeight: '700' },
  monthPanel: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderRadius: 32,
    backgroundColor: '#050505',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  monthPanelTop: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Tokens.spacing.m,
  },
  sectionSpacing: {
    marginTop: Tokens.spacing.xl,
  },
  statsSection: {
    marginTop: 34,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Tokens.spacing.m,
    paddingHorizontal: 16,
    marginBottom: Tokens.spacing.m,
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
