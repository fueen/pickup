import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
  Platform,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSubscriptionContext } from '../src/contexts/SubscriptionContext';
import { useStatsContext } from '../src/contexts/StatsContext';
import { StatCard } from '../src/components/settings/StatCard';
import { SettingsSection } from '../src/components/settings/SettingsSection';
import { SettingsRow } from '../src/components/settings/SettingsRow';
import { Tokens } from '../src/design-tokens';

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) {
    return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  }
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(1)} MB`;
  }
  if (bytes >= 1_000) {
    return `${(bytes / 1_000).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { isPro, subscriptionType, devProEnabled, setDevPro } = useSubscriptionContext();
  const {
    totalViewed,
    totalDeleted,
    totalFreedBytes,
    streakDays,
  } = useStatsContext();

  const subscriptionLabel = isPro
    ? `Pro (${subscriptionLabelFromType(subscriptionType)})`
    : '免费版';

  const handleRateApp = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/id0000000000',
      android: 'https://play.google.com/store/apps/details?id=com.pickup',
    });
    if (storeUrl) {
      Linking.openURL(storeUrl).catch(() =>
        Alert.alert('无法打开链接', '请稍后重试'),
      );
    }
  };

  const handlePrivacy = () => {
    Linking.openURL('https://pickup.app/privacy').catch(() =>
      Alert.alert('无法打开链接', '请稍后重试'),
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>设置</Text>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subscription Status */}
        <SettingsSection title="订阅状态">
          <SettingsRow
            label="当前方案"
            rightContent={
              <Text style={subscriptionLabelStyle(isPro)}>
                {subscriptionLabel}
              </Text>
            }
            showArrow={false}
          />
          {!isPro && (
            <SettingsRow
              label="升级 Pro"
              onPress={() => router.push('/paywall')}
              rightContent={
                <Text style={styles.proBadge}>PRO</Text>
              }
            />
          )}
        </SettingsSection>

        {/* Statistics */}
        <SettingsSection title="统计">
          <View style={styles.statsGrid}>
            <StatCard label="已浏览" value={totalViewed} />
            <StatCard label="已删除" value={totalDeleted} />
          </View>
          <View style={styles.statsGrid}>
            <StatCard label="连续天数" value={streakDays} unit="天" />
            <StatCard
              label="释放空间"
              value={formatBytes(totalFreedBytes)}
            />
          </View>
        </SettingsSection>

        {/* Help */}
        <SettingsSection title="帮助">
          <SettingsRow
            label="使用指南"
            onPress={() =>
              Alert.alert(
                '使用指南',
                '1. 浏览照片，左滑删除右滑保留\n2. 每15张一组，完成一组后确认删除\n3. Pro用户无限使用，免费用户每日20组',
              )
            }
          />
          <SettingsRow
            label="评分支持"
            onPress={handleRateApp}
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="关于">
          <SettingsRow
            label="隐私政策"
            onPress={handlePrivacy}
          />
          <SettingsRow
            label="版本"
            rightContent={
              <Text style={styles.secondaryText}>1.0.0</Text>
            }
            showArrow={false}
          />
        </SettingsSection>

        {/* Dev Tools — tap version text 5 times to reveal */}
        <DevToolsSection devProEnabled={devProEnabled} onToggleDevPro={setDevPro} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function subscriptionLabelFromType(
  type: string,
): string {
  switch (type) {
    case 'weekly':
      return '周订阅';
    case 'monthly':
      return '月订阅';
    case 'yearly':
      return '年订阅';
    case 'lifetime':
      return '永久';
    default:
      return '免费';
  }
}

function subscriptionLabelStyle(isPro: boolean) {
  return {
    ...Tokens.typography.body,
    color: isPro ? Tokens.color.safe : Tokens.color.textSecondary,
    fontWeight: '600' as const,
  };
}

function DevToolsSection({
  devProEnabled,
  onToggleDevPro,
}: {
  devProEnabled: boolean;
  onToggleDevPro: (v: boolean) => Promise<void>;
}) {
  const [visible, setVisible] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  if (!visible) {
    return (
      <TouchableOpacity
        style={{ height: 12, marginTop: 20, alignItems: 'center', justifyContent: 'center' }}
        activeOpacity={1}
        onPress={() => {
          const next = tapCount + 1;
          setTapCount(next);
          if (next >= 5) setVisible(true);
        }}
      />
    );
  }

  return (
    <SettingsSection title="开发者工具">
      <SettingsRow
        label="开发者 Pro 模式"
        rightContent={
          <Switch
            value={devProEnabled}
            onValueChange={onToggleDevPro}
            trackColor={{
              false: Tokens.color.surfaceElevated,
              true: Tokens.color.safe,
            }}
          />
        }
        showArrow={false}
      />
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.color.background,
  },
  heading: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
    paddingTop: 60,
    paddingHorizontal: Tokens.spacing.xl,
    paddingBottom: Tokens.spacing.l,
  },
  scrollContent: {
    paddingHorizontal: Tokens.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Tokens.spacing.m,
    padding: Tokens.spacing.l,
  },
  proBadge: {
    ...Tokens.typography.caption,
    color: Tokens.color.safe,
    fontWeight: '700',
    backgroundColor: `${Tokens.color.safe}20`,
    paddingHorizontal: Tokens.spacing.s,
    paddingVertical: 2,
    borderRadius: Tokens.radius.pill,
    overflow: 'hidden',
  },
  secondaryText: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
  },
  bottomSpacer: {
    height: 60,
  },
});
