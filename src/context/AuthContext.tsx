import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    // FIX: The `User` type from 'firebase/auth' is not a value, so it must be imported as a type.
    type User as FirebaseUser,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { QueueItem } from './OrderContext';
import { AvailableReward, tierThresholds } from '../data/mockRewards';

export interface RewardHistory {
  id: string;
  type: 'earned' | 'redeemed';
  points: number;
  description: string;
  date: Date;
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
    email: string | null;
    firstName: string;
    lastName: string;
    phone?: string;
    photoURL?: string;
    createdAt: Date;
    role?: 'admin' | 'staff';
    
    // Stats & Rewards
    totalOrders: number;
    totalSpent: number;
    currentPoints: number;
    lifetimePoints: number;
    tier: 'bronze' | 'silver' | 'gold';
    rewardsHistory: RewardHistory[];
    preferences: UserPreferences;
    cart?: any[]; // To hold cart data in Firestore
}

interface AuthContextType {
    currentUser: UserProfile | null;
    loading: boolean;
    register: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<void>;
    login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
    logout: () => Promise<void>;
    processNewOrderForUser: (order: QueueItem) => Promise<void>;
    redeemReward: (reward: AvailableReward) => Promise<void>;
    updateUserProfile: (updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    const userProfile: UserProfile = {
                        uid: user.uid,
                        email: user.email,
                        firstName: data.firstName || 'User',
                        lastName: data.lastName || '',
                        phone: data.phone || '',
                        photoURL: data.photoURL,
                        createdAt: data.createdAt?.toDate() || new Date(),
                        role: data.role,
                        totalOrders: data.totalOrders ?? 0,
                        totalSpent: data.totalSpent ?? 0,
                        currentPoints: data.currentPoints ?? 0,
                        lifetimePoints: data.lifetimePoints ?? 0,
                        tier: data.tier || 'bronze',
                        rewardsHistory: (data.rewardsHistory || []).map((h: any) => ({ ...h, date: h.date.toDate() })).sort((a: any, b: any) => b.date - a.date),
                        preferences: data.preferences || { notifications: { push: true, emailUpdates: true, marketing: false }, theme: 'auto', privacy: { shareUsageData: true, personalizedRecs: true } },
                    };
                    setCurrentUser(userProfile);
                } else {
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const register = async (email: string, password: string, firstName: string, lastName: string, phone: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const welcomeBonus: RewardHistory = {
            id: `rh-${Date.now()}`,
            type: 'earned',
            points: 25,
            description: 'Welcome Bonus',
            date: new Date(),
        };

        const userProfileData: Omit<UserProfile, 'uid' | 'email'> = {
            firstName,
            lastName,
            phone: phone || '',
            createdAt: new Date(),
            totalOrders: 0,
            totalSpent: 0,
            currentPoints: 25,
            lifetimePoints: 25,
            tier: 'bronze',
            rewardsHistory: [welcomeBonus],
            preferences: { notifications: { push: true, emailUpdates: true, marketing: false }, theme: 'auto', privacy: { shareUsageData: true, personalizedRecs: true } },
            cart: [],
        };
        
        await setDoc(doc(db, 'users', user.uid), userProfileData);
    };

    const login = async (email: string, password: string, rememberMe: boolean) => {
        const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistence);
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        await signOut(auth);
    };

    const processNewOrderForUser = async (order: QueueItem) => {
        if (!currentUser) return;
        
        const pointsEarned = Math.floor(order.totalAmount / 10);
        const newRewardEntry: RewardHistory = {
            id: `rh-${Date.now()}`,
            type: 'earned',
            points: pointsEarned,
            description: `Purchase - Order #${order.orderNumber}`,
            date: new Date(),
        };

        const newLifetimePoints = currentUser.lifetimePoints + pointsEarned;
        let newTier = currentUser.tier;
        if (currentUser.tier === 'bronze' && newLifetimePoints >= tierThresholds.silver.min) newTier = 'silver';
        if (currentUser.tier === 'silver' && newLifetimePoints >= tierThresholds.gold.min) newTier = 'gold';

        const updatedProfile: UserProfile = {
            ...currentUser,
            totalOrders: currentUser.totalOrders + 1,
            totalSpent: currentUser.totalSpent + order.totalAmount,
            currentPoints: currentUser.currentPoints + pointsEarned,
            lifetimePoints: newLifetimePoints,
            tier: newTier,
            rewardsHistory: [newRewardEntry, ...currentUser.rewardsHistory],
        };
        setCurrentUser(updatedProfile);
        
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
            totalOrders: increment(1),
            totalSpent: increment(order.totalAmount),
            currentPoints: increment(pointsEarned),
            lifetimePoints: increment(pointsEarned),
            tier: newTier,
            rewardsHistory: [newRewardEntry, ...currentUser.rewardsHistory]
        });
    };

    const redeemReward = async (reward: AvailableReward) => {
        if (!currentUser || currentUser.currentPoints < reward.pointsCost) return;

        const newHistoryEntry: RewardHistory = {
            id: `rh-${Date.now()}`,
            type: 'redeemed',
            points: -reward.pointsCost,
            description: `${reward.name} Redeemed`,
            date: new Date(),
        };
        
        const updatedProfile: UserProfile = {
            ...currentUser,
            currentPoints: currentUser.currentPoints - reward.pointsCost,
            rewardsHistory: [newHistoryEntry, ...currentUser.rewardsHistory],
        };
        setCurrentUser(updatedProfile);
        
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
            currentPoints: increment(-reward.pointsCost),
            rewardsHistory: [newHistoryEntry, ...currentUser.rewardsHistory],
        });
    };
    
    const updateUserProfile = async (updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>>) => {
        if (!currentUser) return;
        setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
        
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, updates);
    };

    const value = {
        currentUser,
        loading,
        register,
        login,
        logout,
        processNewOrderForUser,
        redeemReward,
        updateUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
