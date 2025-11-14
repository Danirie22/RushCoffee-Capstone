
export interface RewardHistory {
  id: string;
  type: 'earned' | 'redeemed';
  points: number;
  description: string;
  date: Date;
}

export interface UserRewards {
  userId: string;
  currentPoints: number;
  lifetimePoints: number;
  tier: 'bronze' | 'silver' | 'gold';
  history: RewardHistory[];
}

export interface AvailableReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  imageUrl: string;
  category: 'drink' | 'food' | 'discount';
  available: boolean;
  displayOrder: number;
}

export const tierThresholds = {
  bronze: { min: 0, max: 299, name: 'Bronze' },
  silver: { min: 300, max: 999, name: 'Silver' },
  gold: { min: 1000, max: Infinity, name: 'Gold' },
};
