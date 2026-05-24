import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Tokens } from '../../design-tokens';

interface MonthData {
  month: string;
  count: number;
  isCurrent: boolean;
}

interface Props {
  data: MonthData[];
}

const CHART_HEIGHT = 200;
const BAR_WIDTH = 32;
const BAR_GAP = 20;

export function MonthlyChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>暂无数据</Text>
      </View>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {data.map((item, index) => {
          const barHeight = Math.max(4, (item.count / maxCount) * (CHART_HEIGHT - 30));
          return (
            <View key={index} style={[styles.barWrap, { marginRight: index < data.length - 1 ? BAR_GAP : 0 }]}>
              <Text style={styles.count}>{item.count}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: item.isCurrent ? '#FFD633' : Tokens.color.accent,
                      opacity: item.isCurrent ? 1.0 : 0.8,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.month, item.isCurrent && styles.currentMonth]}>
                {item.month}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingVertical: 16,
    backgroundColor: Tokens.color.surface,
    borderRadius: 16,
    marginHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  barWrap: { alignItems: 'center' },
  count: { fontSize: 11, color: Tokens.color.textSecondary, marginBottom: 6, fontWeight: '600' },
  barTrack: { height: CHART_HEIGHT - 30, justifyContent: 'flex-end', width: BAR_WIDTH },
  bar: { width: BAR_WIDTH, borderRadius: 6 },
  month: { fontSize: 12, color: Tokens.color.textSecondary, marginTop: 8 },
  currentMonth: { color: Tokens.color.accent, fontWeight: '700' },
  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { ...Tokens.typography.body, color: Tokens.color.textMuted },
});
