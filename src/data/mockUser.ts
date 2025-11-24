

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  favoriteItem: string; // Product ID
}

export interface UserPreferences {
  notifications: {
    push: boolean;
    emailUpdates: boolean;
    marketing: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  privacy: {
    shareUsageData: boolean;
    personalizedRecs: boolean;
  };
}

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  role?: 'customer' | 'employee' | 'admin';
  createdAt: Date;
  stats: UserStats;
  preferences: UserPreferences;
}

export const mockUserProfile: UserProfile = {
  uid: 'user-123',
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  email: 'juan.delacruz@example.com',
  phoneNumber: '09171234567',
  photoURL: 'https://i.pravatar.cc/150?u=juan.delacruz',
  createdAt: new Date('2023-01-15T09:30:00Z'),
  role: 'admin',
  stats: {
    totalOrders: 27,
    totalSpent: 8530.50,
    favoriteItem: 'cb-01', // Spanish Latte
  },
  preferences: {
    notifications: {
      push: true,
      emailUpdates: true,
      marketing: false,
    },
    theme: 'auto',
    privacy: {
      shareUsageData: true,
      personalizedRecs: true,
    },
  },
};
