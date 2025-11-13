
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
}

export const tierThresholds = {
  bronze: { min: 0, max: 299, name: 'Bronze' },
  silver: { min: 300, max: 999, name: 'Silver' },
  gold: { min: 1000, max: Infinity, name: 'Gold' },
};

export const mockUserRewards: UserRewards = {
  userId: 'user-123',
  currentPoints: 450,
  lifetimePoints: 1250,
  tier: 'silver',
  history: [
    {
      id: 'rh-01',
      type: 'earned',
      points: 45,
      description: 'Purchase - Order #RC-2025-987',
      date: new Date(new Date().setDate(new Date().getDate() - 1)),
    },
    {
      id: 'rh-02',
      type: 'redeemed',
      points: -100,
      description: 'Free Regular Coffee Redeemed',
      date: new Date(new Date().setDate(new Date().getDate() - 3)),
    },
    {
      id: 'rh-03',
      type: 'earned',
      points: 60,
      description: 'Purchase - Order #RC-2025-955',
      date: new Date(new Date().setDate(new Date().getDate() - 5)),
    },
    {
      id: 'rh-04',
      type: 'earned',
      points: 25,
      description: 'Welcome Bonus',
      date: new Date(new Date().setDate(new Date().getDate() - 30)),
    },
    {
      id: 'rh-05',
      type: 'redeemed',
      points: -150,
      description: 'Free Pastry Redeemed',
      date: new Date(new Date().setDate(new Date().getDate() - 32)),
    },
    {
      id: 'rh-06',
      type: 'earned',
      points: 120,
      description: 'Purchase - Order #RC-2025-890',
      date: new Date(new Date().setDate(new Date().getDate() - 35)),
    },
    {
        id: 'rh-07',
        type: 'earned',
        points: 80,
        description: 'Purchase - Order #RC-2025-871',
        date: new Date(new Date().setDate(new Date().getDate() - 40)),
    },
    {
        id: 'rh-08',
        type: 'earned',
        points: 200,
        description: 'Gold Tier Bonus',
        date: new Date(new Date().setDate(new Date().getDate() - 50)),
    },
    {
        id: 'rh-09',
        type: 'redeemed',
        points: -250,
        description: 'Buy 1 Get 1 Coffee',
        date: new Date(new Date().setDate(new Date().getDate() - 55)),
    },
    {
        id: 'rh-10',
        type: 'earned',
        points: 320,
        description: 'Large Purchase - Order #RC-2025-750',
        date: new Date(new Date().setDate(new Date().getDate() - 60)),
    },
    {
        id: 'rh-11',
        type: 'redeemed',
        points: -50,
        description: 'Upgrade to Large',
        date: new Date(new Date().setDate(new Date().getDate() - 61)),
    },
    {
        id: 'rh-12',
        type: 'earned',
        points: 400,
        description: 'Initial Purchases',
        date: new Date(new Date().setDate(new Date().getDate() - 90)),
    }
  ],
};

export const mockAvailableRewards: AvailableReward[] = [
  {
    id: 'ar-01',
    name: 'Free Regular Coffee',
    description: 'Enjoy any of our classic regular-sized coffees on the house.',
    pointsCost: 100,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-27cf9de0a34d?q=80&w=600',
    category: 'drink',
    available: true,
  },
  {
    id: 'ar-02',
    name: 'Free Pastry of Choice',
    description: 'Pick any delicious pastry from our display case to go with your drink.',
    pointsCost: 150,
    imageUrl: 'https://images.unsplash.com/photo-1582241559934-05591a187c3b?q=80&w=600',
    category: 'food',
    available: true,
  },
  {
    id: 'ar-03',
    name: 'Upgrade to Large',
    description: 'Super-size your favorite drink from regular to large for free.',
    pointsCost: 50,
    imageUrl: 'https://images.unsplash.com/photo-1621842194681-372295056973?q=80&w=600',
    category: 'discount',
    available: true,
  },
  {
    id: 'ar-04',
    name: 'Free Extra Shot',
    description: 'Need a boost? Add an extra shot of espresso to any coffee drink.',
    pointsCost: 75,
    imageUrl: 'https://images.unsplash.com/photo-1608657519717-017a47f4b884?q=80&w=600',
    category: 'discount',
    available: true,
  },
  {
    id: 'ar-05',
    name: '20% Off Next Order',
    description: 'Get a 20% discount on your entire next purchase. No minimum spend.',
    pointsCost: 200,
    imageUrl: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=600',
    category: 'discount',
    available: true,
  },
  {
    id: 'ar-06',
    name: 'Free Iced Coffee',
    description: 'Cool down with a refreshing regular-sized iced coffee of your choice.',
    pointsCost: 120,
    imageUrl: 'https://images.unsplash.com/photo-1593538465215-6a52140a3c97?q=80&w=600',
    category: 'drink',
    available: true,
  },
  {
    id: 'ar-07',
    name: 'Buy 1 Get 1 Coffee',
    description: 'Share the love. Buy any coffee and get a second one of equal or lesser value free.',
    pointsCost: 250,
    imageUrl: 'https://images.unsplash.com/photo-1610852996966-c2471c713b56?q=80&w=600',
    category: 'discount',
    available: true,
  },
  {
    id: 'ar-08',
    name: 'Free Food Item',
    description: 'Choose any single food item from our menu, from pastries to sandwiches.',
    pointsCost: 300,
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c766?q=80&w=600',
    category: 'food',
    available: true,
  },
   {
    id: 'ar-09',
    name: 'Free Matcha Latte',
    description: 'Enjoy our premium, earthy and delicious Matcha Latte on us.',
    pointsCost: 180,
    imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36def?q=80&w=600',
    category: 'drink',
    available: false,
  },
];
