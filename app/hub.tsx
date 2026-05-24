import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
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

  useEffect(() => {
    (async () => {
      try {
        const monthlyCounts: Record<number, number> = {};
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
              const monthIdx = new Date(asset.creationTime).getMonth();
              monthlyCounts[monthIdx] = (monthlyCounts[monthIdx] || 0) + 1;
            }
          }
          hasMore = page.hasNextPage;
          cursor = page.endCursor;
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const data: MonthData[] = [];
        for (let m = 0; m < 12; m++) {
          data.push({
            month: MONTH_LABELS[m],
            count: monthlyCounts[m] || 0,
            isCurrent: m === currentMonth,
          });
        }
        setChartData(data);
        setTotalCount(Object.values(monthlyCounts).reduce((a, b) => a + b, 0));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>照片分析</Text>
      <Text style={styles.subtitle}>共 {totalCount} 张照片</Text>

      {loading ? (
        <ActivityIndicator color={Tokens.color.accent} style={{ marginTop: 40 }} />
      ) : (
        <MonthlyChart data={chartData} />
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
});
