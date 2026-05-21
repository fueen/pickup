import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PurchasesPackage } from 'react-native-purchases';
import { useSubscriptionContext } from '../src/contexts/SubscriptionContext';
import { PricingCard } from '../src/components/settings/PricingCard';
import { Tokens } from '../src/design-tokens';

const FEATURES = [
  '无限次浏览照片组',
  '智能分析每个相册',
  '一键批量清理',
  '优先技术支持',
];

export default function PaywallScreen() {
  const router = useRouter();
  const {
    offerings,
    purchaseInProgress,
    restoreInProgress,
    purchaseError,
    purchase,
    restore,
  } = useSubscriptionContext();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasInitializedRef = useRef(false);

  const packages: PurchasesPackage[] = useMemo(() => {
    const current = offerings?.current;
    if (!current) return [];
    const list: PurchasesPackage[] = [];
    if (current.weekly) list.push(current.weekly);
    if (current.monthly) list.push(current.monthly);
    if (current.annual) list.push(current.annual);
    if (current.lifetime) list.push(current.lifetime);
    return list;
  }, [offerings]);

  // Find recommended (yearly) index
  const recommendedIndex = useMemo(() => {
    if (packages.length === 0) return 0;
    const idx = packages.findIndex(
      (p) =>
        p.identifier.includes('annual') || p.identifier.includes('yearly'),
    );
    return idx >= 0 ? idx : Math.min(1, packages.length - 1);
  }, [packages]);

  // Default select recommended on first render
  useEffect(() => {
    if (!hasInitializedRef.current && packages.length > 0) {
      hasInitializedRef.current = true;
      setSelectedIndex(recommendedIndex);
    }
  }, [packages.length, recommendedIndex]);

  const effectiveSelected =
    packages.length > 0 ? selectedIndex : recommendedIndex;

  const handlePurchase = async () => {
    if (packages.length === 0) return;
    const ok = await purchase(packages[effectiveSelected]);
    if (ok) router.back();
  };

  const handleRestore = async () => {
    const ok = await restore();
    if (ok) router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleClose}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>拾遗 Pro</Text>
        <Text style={styles.subtitle}>解锁无限整理，告别照片焦虑</Text>

        {/* Feature list */}
        <View style={styles.featureList}>
          {FEATURES.map((feat, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>{feat}</Text>
            </View>
          ))}
        </View>

        {/* Pricing cards */}
        {packages.length > 0 ? (
          <View style={styles.pricingGrid}>
            {packages.map((pkg, idx) => (
              <PricingCard
                key={pkg.identifier}
                label={getLabel(pkg)}
                price={pkg.product.priceString}
                period={getPeriod(pkg)}
                isRecommended={idx === recommendedIndex}
                isSelected={idx === effectiveSelected}
                onSelect={() => setSelectedIndex(idx)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Tokens.color.textPrimary} size="large" />
            <Text style={styles.loadingText}>加载价格中...</Text>
          </View>
        )}

        {/* Purchase button */}
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            (purchaseInProgress || packages.length === 0) &&
              styles.buttonDisabled,
          ]}
          onPress={handlePurchase}
          disabled={purchaseInProgress || packages.length === 0}
          activeOpacity={0.8}
        >
          {purchaseInProgress ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.purchaseText}>立即解锁 Pro</Text>
          )}
        </TouchableOpacity>

        {/* Restore button */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={restoreInProgress}
          activeOpacity={0.8}
        >
          {restoreInProgress ? (
            <ActivityIndicator color={Tokens.color.textSecondary} />
          ) : (
            <Text style={styles.restoreText}>恢复购买</Text>
          )}
        </TouchableOpacity>

        {/* Error message */}
        {purchaseError ? (
          <Text style={styles.errorText}>{purchaseError}</Text>
        ) : null}

        {/* Footer legal */}
        <Text style={styles.legal}>
          确认购买后将从你的 Apple ID
          扣款。订阅会自动续订，可在设置中管理或取消。
        </Text>
      </ScrollView>
    </View>
  );
}

function getLabel(pkg: PurchasesPackage): string {
  const id = pkg.identifier.toLowerCase();
  if (id.includes('weekly') || id.includes('week')) return '周订阅';
  if (id.includes('monthly') || id.includes('month')) return '月订阅';
  if (id.includes('annual') || id.includes('yearly') || id.includes('year'))
    return '年订阅';
  if (id.includes('lifetime')) return '永久买断';
  return pkg.identifier;
}

function getPeriod(pkg: PurchasesPackage): string {
  const id = pkg.identifier.toLowerCase();
  if (id.includes('lifetime')) return '永久';
  // RevenueCat product priceString typically includes the period like "¥38.00/mo"
  // If not, we can deduce from the identifier
  if (id.includes('weekly') || id.includes('week')) return '周';
  if (id.includes('monthly') || id.includes('month')) return '月';
  if (id.includes('annual') || id.includes('yearly') || id.includes('year'))
    return '年';
  return '';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.color.background,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Tokens.color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: Tokens.color.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Tokens.spacing.xl,
    paddingTop: 80,
    paddingBottom: Tokens.spacing.xxl,
  },
  title: {
    ...Tokens.typography.headline,
    color: Tokens.color.textPrimary,
    textAlign: 'center',
    fontSize: 34,
    marginBottom: Tokens.spacing.s,
  },
  subtitle: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.xxl,
  },
  featureList: {
    marginBottom: Tokens.spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Tokens.spacing.m,
  },
  checkmark: {
    color: Tokens.color.safe,
    fontSize: 18,
    fontWeight: '700',
    marginRight: Tokens.spacing.m,
    width: 24,
    textAlign: 'center',
  },
  featureText: {
    ...Tokens.typography.body,
    color: Tokens.color.textPrimary,
  },
  pricingGrid: {
    gap: Tokens.spacing.m,
    marginBottom: Tokens.spacing.xl,
  },
  purchaseButton: {
    backgroundColor: Tokens.color.safe,
    borderRadius: Tokens.radius.button,
    paddingVertical: Tokens.spacing.l,
    alignItems: 'center',
    marginBottom: Tokens.spacing.m,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  purchaseText: {
    ...Tokens.typography.body,
    color: '#000000',
    fontWeight: '700',
    fontSize: 18,
  },
  restoreButton: {
    paddingVertical: Tokens.spacing.m,
    alignItems: 'center',
    marginBottom: Tokens.spacing.l,
  },
  restoreText: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
  },
  errorText: {
    ...Tokens.typography.caption,
    color: Tokens.color.danger,
    textAlign: 'center',
    marginBottom: Tokens.spacing.m,
  },
  legal: {
    ...Tokens.typography.caption,
    color: Tokens.color.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Tokens.spacing.xxl,
  },
  loadingText: {
    ...Tokens.typography.caption,
    color: Tokens.color.textSecondary,
    marginTop: Tokens.spacing.m,
  },
});
