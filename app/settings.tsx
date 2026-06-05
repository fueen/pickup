import React, { useState, useRef } from 'react';
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
import { useRouter } from 'expo-router';
import { useSubscriptionContext } from '../src/contexts/SubscriptionContext';
import { SettingsSection } from '../src/components/settings/SettingsSection';
import { SettingsRow } from '../src/components/settings/SettingsRow';
import { Toast } from '../src/components/ui/Toast';
import { GuidePreviewModal } from '../src/components/ui/GuidePreviewModal';
import { Tokens } from '../src/design-tokens';
import { APP_VERSION } from '../src/constants/app-info';
// import { SwipeEffect, getSwipeEffect, setSwipeEffect as saveSwipeEffect } from '../src/services/preferences-service';

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
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [guideVisible, setGuideVisible] = useState(false);
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
                  <Text style={{ color: Tokens.color.accent, fontWeight: '900' }}>∞ 无限</Text>
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

        {/* v2.0: 统计卡片已迁移到 Hub 月份分析下方，个人中心先保持账户/帮助/关于。 */}

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
            onPress={() => setGuideVisible(true)}
          />
          <SettingsRow label="评分支持" onPress={handleRateApp} />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="关于">
          <SettingsRow label="PickUp" onPress={() => router.push('/about')} />
          <SettingsRow label="隐私政策" onPress={handlePrivacy} />
          <SettingsRow
            label="版本"
            rightContent={<Text style={styles.secondaryText}>{APP_VERSION}</Text>}
            showArrow={false}
          />
        </SettingsSection>

        {/* Footer — tap 5 times for dev mode */}
        <TouchableOpacity
          style={styles.footerArea}
          activeOpacity={1}
          onPress={handleFooterTap}
        />

        <View style={{ height: 60 }} />
      </ScrollView>

      <Toast
        visible={toastMsg !== null}
        message={toastMsg ?? ''}
        onDismiss={() => setToastMsg(null)}
      />
      <GuidePreviewModal
        visible={guideVisible}
        onClose={() => setGuideVisible(false)}
        onStart={() => {
          setGuideVisible(false);
          router.push('/');
        }}
      />
    </View>
  );
}

function subscriptionLabelStyle(isPro: boolean) {
  return {
    fontSize: 15,
    fontWeight: '900' as const,
    color: isPro ? Tokens.color.accent : Tokens.color.textSecondary,
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Tokens.color.background },
  heading: {
    fontSize: 50,
    lineHeight: 58,
    fontWeight: '900',
    color: Tokens.color.textPrimary,
    paddingTop: 82,
    paddingHorizontal: 32,
    paddingBottom: 28,
    letterSpacing: 0,
  },
  scrollContent: { paddingHorizontal: 16 },
  proBadge: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
    backgroundColor: Tokens.color.accent,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  todayText: {
    fontSize: 15,
    fontWeight: '900',
    color: Tokens.color.textSecondary,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '900',
    color: Tokens.color.textSecondary,
  },
  footerArea: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 52,
  },
});
