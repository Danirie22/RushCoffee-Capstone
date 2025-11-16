
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
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
    updateUserProfile: (updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>>) => Promise<void>;
    updateUserPhoto: (photoURL: string) => Promise<void>;
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
        let unsubscribeFromFirestore: Unsubscribe | undefined;

        const unsubscribeFromAuth = onAuthStateChanged(auth, async (user: User | null) => {
            if (unsubscribeFromFirestore) {
                unsubscribeFromFirestore();
            }

            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                unsubscribeFromFirestore = onSnapshot(userDocRef, (userDoc) => {
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
                    setLoading(false);
                }, (error) => {
                    console.error("Error listening to user document:", error);
                    setCurrentUser(null);
                    setLoading(false);
                });
            } else {
                setCurrentUser(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeFromAuth();
            if (unsubscribeFromFirestore) {
                unsubscribeFromFirestore();
            }
        };
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
    
    const updateUserProfile = async (updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>>) => {
        if (!currentUser) return;
        
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, updates);
    };

    const updateUserPhoto = async (photoURL: string) => {
        if (!currentUser) return;
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { photoURL });
    };


    const value = {
        currentUser,
        loading,
        register,
        login,
        logout,
        updateUserProfile,
        updateUserPhoto,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
