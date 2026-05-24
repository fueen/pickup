import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MonthlyChart } from '../src/components/hub/MonthlyChart';
import { Tokens } from '../src/design-tokens';

interface MonthData {
  month: string;
  count: number;
  isCurrent: boolean;
}

const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'];

export default function HubScreen() {
  const [chartData, setChartData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const yearlyDataRef = useRef<Record<number, Record<number, number>>>({});
  const availableYearsRef = useRef<number[]>([]);

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
      <Text style={styles.title}>照片分析</Text>
      <Text style={styles.subtitle}>共 {totalCount} 张照片</Text>

      {loading ? (
        <ActivityIndicator color={Tokens.color.accent} style={{ marginTop: 40 }} />
      ) : (
        <>
          <MonthlyChart data={chartData} />

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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background, paddingTop: 60 },
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
});
