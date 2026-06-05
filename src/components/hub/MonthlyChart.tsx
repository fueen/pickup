import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Tokens } from '../../design-tokens';

interface MonthData {
  month: string;
  count: number;
  isCurrent: boolean;
}

interface Props {
  data: MonthData[];
  onMonthPress?: (monthIndex: number, item: MonthData) => void;
}

const CHART_HEIGHT = 178;
const BAR_WIDTH = 34;
const BAR_GAP = 18;

export function MonthlyChart({ data, onMonthPress }: Props) {
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
          const barHeight = Math.max(10, (item.count / maxCount) * (CHART_HEIGHT - 44));
          return (
            <TouchableOpacity
              key={index}
              style={[styles.barWrap, { marginRight: index < data.length - 1 ? BAR_GAP : 0 }]}
              activeOpacity={item.count > 0 ? 0.68 : 1}
              onPress={() => onMonthPress?.(index, item)}
            >
              <Text style={[styles.count, item.isCurrent && styles.currentCount]}>{item.count}</Text>
              <View style={styles.barTrack}>
                {item.count > 0 ? <View style={styles.barGlow} /> : null}
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: item.isCurrent ? Tokens.color.accent : 'rgba(233,255,63,0.78)',
                      opacity: item.count > 0 ? 1 : 0.16,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.month, item.isCurrent && styles.currentMonth]}>
                {item.month}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 18,
    alignItems: 'flex-end',
  },
  barWrap: { alignItems: 'center' },
  count: {
    fontSize: 12,
    lineHeight: 15,
    color: Tokens.color.textMuted,
    marginBottom: 8,
    fontWeight: '900',
  },
  currentCount: {
    color: Tokens.color.textPrimary,
  },
  barTrack: {
    height: CHART_HEIGHT - 34,
    justifyContent: 'flex-end',
    width: BAR_WIDTH,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.045)',
    overflow: 'hidden',
  },
  barGlow: {
    position: 'absolute',
    bottom: 0,
    left: -5,
    right: -5,
    height: 58,
    borderRadius: 999,
    backgroundColor: 'rgba(233,255,63,0.10)',
  },
  bar: { width: BAR_WIDTH, borderTopLeftRadius: 999, borderTopRightRadius: 999 },
  month: {
    fontSize: 12,
    color: Tokens.color.textMuted,
    marginTop: 10,
    fontWeight: '900',
  },
  currentMonth: { color: Tokens.color.accent, fontWeight: '900' },
  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { ...Tokens.typography.body, color: Tokens.color.textMuted },
});
