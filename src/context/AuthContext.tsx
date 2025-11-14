

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    User as FirebaseUser,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
}

interface AuthContextType {
    currentUser: UserProfile | null;
    loading: boolean;
    register: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<void>;
    login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
    logout: () => Promise<void>;
    processNewOrderForUser?: (order: QueueItem) => void;
    redeemReward?: (reward: AvailableReward) => void;
    updateUserProfile?: (updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>>) => void;
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
                // Fetch user profile from Firestore
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
                        rewardsHistory: (data.rewardsHistory || []).map((h: any) => ({ ...h, date: h.date.toDate() })),
                        preferences: data.preferences || { notifications: { push: true, emailUpdates: true, marketing: false }, theme: 'auto', privacy: { shareUsageData: true, personalizedRecs: true } },
                    };
                    setCurrentUser(userProfile);
                } else {
                     // This might happen if user is created but firestore doc fails.
                     // For now, we can set a basic profile.
                    setCurrentUser({
                        uid: user.uid,
                        email: user.email,
                        firstName: 'User',
                        lastName: '',
                        createdAt: new Date(),
                        totalOrders: 0,
                        totalSpent: 0,
                        currentPoints: 0,
                        lifetimePoints: 0,
                        tier: 'bronze',
                        rewardsHistory: [],
                        preferences: { notifications: { push: true, emailUpdates: true, marketing: false }, theme: 'auto', privacy: { shareUsageData: true, personalizedRecs: true } }
                    });
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
            rewardsHistory: [{
                id: `rh-${Date.now()}`,
                type: 'earned',
                points: 25,
                description: 'Welcome Bonus',
                date: new Date(),
            }],
            preferences: { notifications: { push: true, emailUpdates: true, marketing: false }, theme: 'auto', privacy: { shareUsageData: true, personalizedRecs: true } }
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

    const processNewOrderForUser = (order: QueueItem) => {
        if (!currentUser) return;
        
        const pointsEarned = Math.floor(order.totalAmount / 10);
        const newRewardEntry: RewardHistory = {
            id: `rh-${Date.now()}`,
            type: 'earned',
            points: pointsEarned,
            description: `Purchase - Order #${order.orderNumber}`,
            date: new Date(),
        };

        setCurrentUser(prevUser => {
            if (!prevUser) return null;
            
            const newLifetimePoints = prevUser.lifetimePoints + pointsEarned;
            let newTier = prevUser.tier;
            if (prevUser.tier === 'bronze' && newLifetimePoints >= tierThresholds.silver.min) {
                newTier = 'silver';
            }
            if (prevUser.tier === 'silver' && newLifetimePoints >= tierThresholds.gold.min) {
                newTier = 'gold';
            }

            return {
                ...prevUser,
                totalOrders: prevUser.totalOrders + 1,
                totalSpent: prevUser.totalSpent + order.totalAmount,
                currentPoints: prevUser.currentPoints + pointsEarned,
                lifetimePoints: newLifetimePoints,
                tier: newTier,
                rewardsHistory: [newRewardEntry, ...prevUser.rewardsHistory],
            };
        });
        // In a real app, we would also update the user document in Firestore here.
    };

    const redeemReward = (reward: AvailableReward) => {
        if (!currentUser || currentUser.currentPoints < reward.pointsCost) return;

        const newHistoryEntry: RewardHistory = {
            id: `rh-${Date.now()}`,
            type: 'redeemed',
            points: -reward.pointsCost,
            description: `${reward.name} Redeemed`,
            date: new Date(),
        };

        setCurrentUser(prevUser => {
            if (!prevUser) return null;
            return {
                ...prevUser,
                currentPoints: prevUser.currentPoints - reward.pointsCost,
                rewardsHistory: [newHistoryEntry, ...prevUser.rewardsHistory],
            };
        });
        // Also update Firestore here in a real app.
    };
    
    const updateUserProfile = (updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>>) => {
        if (!currentUser) return;
        setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
        // Also update Firestore here in a real app.
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
