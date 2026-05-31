import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSubscriptionContext } from '../src/contexts/SubscriptionContext';
import { useStatsContext } from '../src/contexts/StatsContext';
import { StatCard } from '../src/components/settings/StatCard';
import { WeeklyReviewCard } from '../src/components/settings/WeeklyReviewCard';
import { AchievementStrip } from '../src/components/settings/AchievementStrip';
import { SettingsSection } from '../src/components/settings/SettingsSection';
import { SettingsRow } from '../src/components/settings/SettingsRow';
import { Toast } from '../src/components/ui/Toast';
import { Tokens } from '../src/design-tokens';
import { getValidRecentDeletes } from '../src/services/stats-service';
// import { SwipeEffect, getSwipeEffect, setSwipeEffect as saveSwipeEffect } from '../src/services/preferences-service';

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}

function subscriptionLabelFromType(type: string): string {
  switch (type) {
    case 'weekly': return '周订阅';
    case 'monthly': return '月订阅';
    case 'yearly': return '年订阅';
    case 'lifetime': return '永久';
    default: return '免费';
  }
}

// const SWIPE_EFFECTS: { key: SwipeEffect; label: string }[] = [
//   { key: 'default', label: '默认' },
//   { key: 'momentum', label: '仿真' },
//   { key: 'pageFlip', label: '翻页' },
//   { key: 'rubberBand', label: '弹性' },
//   { key: 'smooth', label: '平滑' },
// ];

// function swipeEffectLabel(effect: SwipeEffect): string {
//   return SWIPE_EFFECTS.find(e => e.key === effect)?.label ?? '默认';
// }

export default function SettingsScreen() {
  const router = useRouter();
  const {
    isPro, subscriptionType, devProEnabled, setDevPro,
    todayGroupCount,
  } = useSubscriptionContext();
  const { totalViewed, totalDeleted, totalFreedBytes, streakDays, weeklyHistory } = useStatsContext();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [recentDeleteCount, setRecentDeleteCount] = useState(0);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // const [swipeEffect, setSwipeEffectState] = useState<SwipeEffect>('default');

  // useEffect(() => { getSwipeEffect().then(setSwipeEffectState); }, []);

  const effectivePro = isPro || devProEnabled;
  const subscriptionLabel = effectivePro
    ? (devProEnabled ? 'Pro' : `Pro (${subscriptionLabelFromType(subscriptionType)})`)
    : '免费版';

  const handleFooterTap = () => {
    const next = tapCountRef.current + 1;
    tapCountRef.current = next;

    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; }, 2000);

    if (next >= 5) {
      tapCountRef.current = 0;
      if (devProEnabled) {
        setDevPro(false);
        setToastMsg('已退出开发者模式');
      } else {
        setDevPro(true);
        setToastMsg('已进入开发者模式');
      }
    }
  };

  // const showSwipeEffectPicker = () => {
  //   const buttons = SWIPE_EFFECTS.map((e) => ({
  //     text: e.label + (swipeEffect === e.key ? ' ✓' : ''),
  //     onPress: () => {
  //       setSwipeEffectState(e.key);
  //       saveSwipeEffect(e.key);
  //     },
  //   }));
  //   Alert.alert('选择滑动特效', undefined, [...buttons, { text: '取消', style: 'cancel' as const }]);
  // };

  const handleRateApp = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/id0000000000',
      android: 'https://play.google.com/store/apps/details?id=com.pickup',
    });
    if (storeUrl) Linking.openURL(storeUrl).catch(() => Alert.alert('无法打开链接', '请稍后重试'));
  };

  const handlePrivacy = () => {
    Linking.openURL('https://pickup.app/privacy').catch(() => Alert.alert('无法打开链接', '请稍后重试'));
  };

  useFocusEffect(useCallback(() => {
    let isActive = true;
    getValidRecentDeletes()
      .then((records) => {
        if (isActive) setRecentDeleteCount(records.length);
      })
      .catch(() => {
        if (isActive) setRecentDeleteCount(0);
      });

    return () => {
      isActive = false;
    };
  }, []));

  const isProStyle = effectivePro;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>PickUp</Text>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subscription */}
        <SettingsSection title="会员">
          <SettingsRow
            label="当前方案"
            rightContent={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={subscriptionLabelStyle(isProStyle)}>
                  {subscriptionLabel}
                </Text>
                {!effectivePro && (
                  <TouchableOpacity onPress={() => router.push('/paywall')}>
                    <Text style={styles.proBadge}>升级 Pro</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            showArrow={false}
          />
          <SettingsRow
            label="今日剩余"
            rightContent={
              <Text style={styles.todayText}>
                {effectivePro ? (
                  <Text style={{ color: '#FFCC00', fontWeight: '700' }}>∞ 无限</Text>
                ) : (
                  <>
                    <Text style={{ color: todayGroupCount >= Tokens.photo.freeDailyLimit ? Tokens.color.danger : Tokens.color.textPrimary }}>
                      {Math.max(0, Tokens.photo.freeDailyLimit - todayGroupCount)}
                    </Text>
                    <Text style={{ color: Tokens.color.textMuted }}> / {Tokens.photo.freeDailyLimit} 组</Text>
                  </>
                )}
              </Text>
            }
            showArrow={false}
          />
        </SettingsSection>

        {/* Statistics */}
        <SettingsSection title="统计">
          <View style={styles.statsGrid}>
            <StatCard label="已浏览" value={totalViewed} valueColor={Tokens.color.textPrimary} />
            <StatCard
              label="最近删除"
              value={recentDeleteCount}
              valueColor={Tokens.color.danger}
              tintColor={Tokens.color.danger}
            />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              label="连续天数"
              value={streakDays}
              unit="天"
              valueColor={Tokens.color.safe}
              tintColor={Tokens.color.safe}
            />
            <StatCard
              label="释放空间"
              value={formatBytes(totalFreedBytes)}
              valueColor={Tokens.color.accent}
              tintColor={Tokens.color.accent}
            />
          </View>
        </SettingsSection>

        {/* More features */}
        <SettingsSection title="更多功能">
          <View style={styles.moreContent}>
            <TouchableOpacity
              style={styles.monthFeature}
              onPress={() => router.push('/hub')}
              activeOpacity={0.74}
            >
              <View style={styles.monthIconWrap}>
                <MaterialCommunityIcons name="chart-box-outline" size={24} color={Tokens.color.accent} />
              </View>
              <View style={styles.monthCopy}>
                <Text style={styles.monthTitle}>月份分析</Text>
                <Text style={styles.monthSubtitle}>按月份回看照片数量变化</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={Tokens.color.textMuted} />
            </TouchableOpacity>

            <View style={styles.featureDivider} />

            <WeeklyReviewCard weeklyHistory={weeklyHistory} streakDays={streakDays} embedded />

            <View style={styles.featureDividerSoft} />

            <AchievementStrip
              totalViewed={totalViewed}
              totalDeleted={totalDeleted}
              totalFreedBytes={totalFreedBytes}
              streakDays={streakDays}
              recentDeleteCount={recentDeleteCount}
              embedded
            />
          </View>
        </SettingsSection>

        {/* Swipe Effect — temporarily disabled */}
        {/* <SettingsSection title="滑动效果">
          <SettingsRow
            label="照片滑动特效"
            rightContent={<Text style={styles.secondaryText}>{swipeEffectLabel(swipeEffect)}</Text>}
            onPress={() => showSwipeEffectPicker()}
          />
        </SettingsSection> */}

        {/* Help */}
        <SettingsSection title="帮助">
          <SettingsRow
            label="使用指南"
            onPress={() =>
              Alert.alert(
                '使用指南',
                '1. 浏览照片，上滑删除下滑保留\n2. 每10张一组，完成一组后确认删除\n3. Pro用户无限使用，免费用户每日3组',
              )
            }
          />
          <SettingsRow label="评分支持" onPress={handleRateApp} />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="关于">
          <SettingsRow label="隐私政策" onPress={handlePrivacy} />
          <SettingsRow
            label="版本"
            rightContent={<Text style={styles.secondaryText}>1.1.0</Text>}
            showArrow={false}
          />
        </SettingsSection>

        {/* Footer — tap 5 times for dev mode */}
        <TouchableOpacity
          style={styles.footerArea}
          activeOpacity={1}
          onPress={handleFooterTap}
        >
          <Text style={styles.footerText}>PickUp · 记忆由你选择</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>

      <Toast
        visible={toastMsg !== null}
        message={toastMsg ?? ''}
        onDismiss={() => setToastMsg(null)}
      />
    </View>
  );
}

function subscriptionLabelStyle(isPro: boolean) {
  return {
    fontSize: 14,
    fontWeight: '600' as const,
    color: isPro ? '#FFCC00' : Tokens.color.textSecondary,
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background },
  heading: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
    paddingTop: 60,
    paddingHorizontal: Tokens.spacing.xl,
    paddingBottom: Tokens.spacing.l,
    letterSpacing: 4,
  },
  scrollContent: { paddingHorizontal: Tokens.spacing.xl },
  statsGrid: {
    flexDirection: 'row',
    gap: Tokens.spacing.m,
    padding: Tokens.spacing.l,
  },
  moreContent: {
    padding: Tokens.spacing.l,
    gap: Tokens.spacing.l,
  },
  monthFeature: {
    minHeight: 76,
    borderRadius: 18,
    padding: Tokens.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing.m,
    backgroundColor: 'rgba(255,204,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,204,0,0.16)',
  },
  monthIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,204,0,0.14)',
  },
  monthCopy: {
    flex: 1,
  },
  monthTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: Tokens.color.textPrimary,
  },
  monthSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: Tokens.color.textSecondary,
  },
  featureDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  featureDividerSoft: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  proBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
    backgroundColor: '#FFCC00',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    overflow: 'hidden',
  },
  todayText: {
    fontSize: 14,
    color: Tokens.color.textSecondary,
  },
  secondaryText: {
    fontSize: 14,
    color: Tokens.color.textSecondary,
  },
  footerArea: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#2C2C2E',
  },
});
