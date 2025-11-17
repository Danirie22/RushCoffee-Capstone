
import * as React from 'react';
// FIX: Update Firebase imports for v8 compatibility.
import firebase from 'firebase/compat/app';
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
    sendPasswordReset: (email: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    updateUserProfile: (updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>>) => Promise<void>;
    updateUserPhoto: (photoURL: string) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // FIX: Use `() => void` for Unsubscribe type, as onSnapshot returns this in v8.
        let unsubscribeFromFirestore: (() => void) | undefined;

        // FIX: Use auth.onAuthStateChanged and firebase.User for v8.
        const unsubscribeFromAuth = auth.onAuthStateChanged(async (user: firebase.User | null) => {
            if (unsubscribeFromFirestore) {
                unsubscribeFromFirestore();
            }

            if (user) {
                // FIX: Use v8 Firestore syntax for document reference and snapshot.
                const userDocRef = db.collection('users').doc(user.uid);
                unsubscribeFromFirestore = userDocRef.onSnapshot((userDoc) => {
                    if (userDoc.exists) {
                        const data = userDoc.data()!;
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
                        // This might happen briefly if a user signs up with Google and the doc isn't created yet.
                        // We will let the sign-in/register functions handle doc creation.
                        console.log("User document not found for UID:", user.uid);
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
        // FIX: Use auth.createUserWithEmailAndPassword for v8.
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user!;

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
        
        // FIX: Use v8 Firestore syntax to set document.
        await db.collection('users').doc(user.uid).set(userProfileData);
    };
    
    const signInWithGoogle = async () => {
        // FIX: Use firebase.auth.GoogleAuthProvider for v8.
        const provider = new firebase.auth.GoogleAuthProvider();
        // FIX: Use auth.signInWithPopup for v8 and get additionalUserInfo from result.
        const result = await auth.signInWithPopup(provider);
        const user = result.user!;
        const additionalUserInfo = result.additionalUserInfo;

        if (additionalUserInfo?.isNewUser) {
            // New user: create their profile document
            const nameParts = user.displayName?.split(' ') || ['New', 'User'];
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';

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
                photoURL: user.photoURL || undefined,
                createdAt: new Date(),
                totalOrders: 0,
                totalSpent: 0,
                currentPoints: 25, // Welcome bonus
                lifetimePoints: 25,
                tier: 'bronze',
                rewardsHistory: [welcomeBonus],
                preferences: { notifications: { push: true, emailUpdates: true, marketing: false }, theme: 'auto', privacy: { shareUsageData: true, personalizedRecs: true } },
                cart: [],
            };

            // FIX: Use v8 Firestore syntax to set document.
            await db.collection('users').doc(user.uid).set(userProfileData);
        }
        // Existing users will be handled by the onAuthStateChanged listener
    };

    const login = async (email: string, password: string, rememberMe: boolean) => {
        // FIX: Use firebase.auth.Auth.Persistence for v8.
        const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
        // FIX: Use auth.setPersistence for v8.
        await auth.setPersistence(persistence);
        // FIX: Use auth.signInWithEmailAndPassword for v8.
        await auth.signInWithEmailAndPassword(email, password);
    };

    const logout = async () => {
        // FIX: Use auth.signOut for v8.
        await auth.signOut();
    };
    
    const sendPasswordReset = async (email: string) => {
        // FIX: Use auth.sendPasswordResetEmail for v8.
        await auth.sendPasswordResetEmail(email);
    };
    
    const updateUserProfile = async (updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>>) => {
        if (!currentUser) return;
        
        // FIX: Use v8 Firestore syntax to update document.
        const userDocRef = db.collection('users').doc(currentUser.uid);
        await userDocRef.update(updates);
    };

    const updateUserPhoto = async (photoURL: string) => {
        if (!currentUser) return;
        // FIX: Use v8 Firestore syntax to update document.
        const userDocRef = db.collection('users').doc(currentUser.uid);
        await userDocRef.update({ photoURL });
    };


    const value = {
        currentUser,
        loading,
        register,
        login,
        logout,
        sendPasswordReset,
        signInWithGoogle,
        updateUserProfile,
        updateUserPhoto,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};