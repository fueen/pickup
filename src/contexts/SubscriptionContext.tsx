import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfoUpdateListener,
} from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionType, DailyUsage } from '../types/subscription';
import { getTodayKey, isNewDay } from '../utils/date-utils';
import {
  configurePurchases,
  getOfferings,
  getCustomerInfo,
  purchasePackage,
  restorePurchases,
  isProActive,
  getSubscriptionType,
} from '../services/subscription-service';
import { Tokens } from '../design-tokens';

const DAILY_USAGE_KEY = 'dailyUsage';
const DEV_PRO_KEY = 'devProEnabled';

export interface SubscriptionContextValue {
  isPro: boolean;
  subscriptionType: SubscriptionType;
  offerings: PurchasesOfferings | null;
  purchaseInProgress: boolean;
  restoreInProgress: boolean;
  purchaseError: string | null;
  todayGroupCount: number;
  dailyUsageLoaded: boolean;
  isLimitReached: boolean;
  canBrowseNextGroup: boolean;
  devProEnabled: boolean;
  setDevPro: (v: boolean) => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  incrementGroupCount: () => void;
}

const SubscriptionCtx = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPro, setIsPro] = useState(false);
  const [subscriptionType, setSubType] = useState<SubscriptionType>('free');
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [todayGroupCount, setTodayGroupCount] = useState(0);
  const [dailyUsageLoaded, setDailyUsageLoaded] = useState(false);
  const [devProEnabled, setDevProEnabled] = useState(false);
  const listenerRef = useRef<CustomerInfoUpdateListener | null>(null);

  useEffect(() => {
    configurePurchases();
    loadSubscriptionState();
    loadDailyUsage();
    loadDevPro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listenerRef.current = (info) => {
      setIsPro(isProActive(info));
      if (isProActive(info)) setSubType(getSubscriptionType(info));
    };
    Purchases.addCustomerInfoUpdateListener(listenerRef.current!);
    return () => {
      if (listenerRef.current) {
        Purchases.removeCustomerInfoUpdateListener(listenerRef.current);
      }
    };
  }, []);

  const loadSubscriptionState = async () => {
    try {
      const info = await getCustomerInfo();
      setIsPro(isProActive(info));
      setSubType(getSubscriptionType(info));
      const offs = await getOfferings();
      setOfferings(offs);
    } catch (e) {
      console.warn('RevenueCat 加载失败:', e);
    }
  };

  const loadDailyUsage = async () => {
    try {
      const raw = await AsyncStorage.getItem(DAILY_USAGE_KEY);
      if (!raw) {
        setTodayGroupCount(0);
        setDailyUsageLoaded(true);
        return;
      }
      const usage: DailyUsage = JSON.parse(raw);
      if (isNewDay(usage.date)) {
        setTodayGroupCount(0);
        AsyncStorage.setItem(
          DAILY_USAGE_KEY,
          JSON.stringify({ date: getTodayKey(), count: 0 }),
        ).catch((e) => console.warn('Failed to reset daily usage:', e));
      } else {
        setTodayGroupCount(usage.count);
      }
      setDailyUsageLoaded(true);
    } catch {
      setTodayGroupCount(0);
      setDailyUsageLoaded(true);
    }
  };

  const incrementGroupCount = useCallback(() => {
    setTodayGroupCount((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem(
        DAILY_USAGE_KEY,
        JSON.stringify({ date: getTodayKey(), count: next }),
      ).catch((e) => console.warn('Failed to save daily usage:', e));
      return next;
    });
  }, []);

  const isLimitReached =
    !isPro && !devProEnabled && todayGroupCount >= Tokens.photo.freeDailyLimit;
  const canBrowseNextGroup = dailyUsageLoaded && (isPro || devProEnabled || !isLimitReached);

  const loadDevPro = async () => {
    try {
      const raw = await AsyncStorage.getItem(DEV_PRO_KEY);
      setDevProEnabled(raw === 'true');
    } catch { /* ignore */ }
  };

  const setDevPro = async (v: boolean) => {
    setDevProEnabled(v);
    await AsyncStorage.setItem(DEV_PRO_KEY, v ? 'true' : 'false');
  };

  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    setPurchaseInProgress(true);
    setPurchaseError(null);
    try {
      const info = await purchasePackage(pkg);
      setIsPro(isProActive(info));
      setSubType(getSubscriptionType(info));
      return true;
    } catch (e) {
      setPurchaseError(e instanceof Error ? e.message : '购买失败');
      return false;
    } finally {
      setPurchaseInProgress(false);
    }
  }, []);

  const restore = useCallback(async (): Promise<boolean> => {
    setRestoreInProgress(true);
    setPurchaseError(null);
    try {
      const info = await restorePurchases();
      setIsPro(isProActive(info));
      setSubType(getSubscriptionType(info));
      return true;
    } catch (e) {
      setPurchaseError(e instanceof Error ? e.message : '恢复购买失败');
      return false;
    } finally {
      setRestoreInProgress(false);
    }
  }, []);

  return (
    <SubscriptionCtx.Provider
      value={{
        isPro,
        subscriptionType,
        offerings,
        purchaseInProgress,
        restoreInProgress,
        purchaseError,
        todayGroupCount,
        dailyUsageLoaded,
        isLimitReached,
        canBrowseNextGroup,
        devProEnabled,
        setDevPro,
        purchase,
        restore,
        incrementGroupCount,
      }}
    >
      {children}
    </SubscriptionCtx.Provider>
  );
}

export function useSubscriptionContext(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionCtx);
  if (!ctx)
    throw new Error(
      'useSubscriptionContext must be inside SubscriptionProvider',
    );
  return ctx;
}
