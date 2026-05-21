import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesPackage,
} from 'react-native-purchases';
import { SubscriptionType } from '../types/subscription';

const REVENUECAT_API_KEY_IOS = '__REVENUECAT_IOS_KEY__';
const REVENUECAT_API_KEY_ANDROID = '__REVENUECAT_ANDROID_KEY__';

export function configurePurchases(): void {
  Purchases.configure({
    apiKey:
      Platform.OS === 'ios'
        ? REVENUECAT_API_KEY_IOS
        : REVENUECAT_API_KEY_ANDROID,
  });
}

export async function getOfferings() {
  return Purchases.getOfferings();
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

export function isProActive(info: CustomerInfo): boolean {
  return info.entitlements.active['pro'] !== undefined;
}

export function getSubscriptionType(info: CustomerInfo): SubscriptionType {
  const entitlement = info.entitlements.active['pro'];
  if (!entitlement) return 'free';
  const id = entitlement.productIdentifier;
  if (id.includes('weekly')) return 'weekly';
  if (id.includes('monthly')) return 'monthly';
  if (id.includes('yearly')) return 'yearly';
  if (id.includes('lifetime')) return 'lifetime';
  return 'free';
}
