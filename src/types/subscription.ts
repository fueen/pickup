export type SubscriptionType =
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'lifetime'
  | 'free';

export interface PricingTier {
  type: SubscriptionType;
  price: string;
  period: string;
  isRecommended: boolean;
}

export interface DailyUsage {
  date: string;
  count: number;
}

export interface DailyStats {
  date: string;
  viewed: number;
  deleted: number;
}
