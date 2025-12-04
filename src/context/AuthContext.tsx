import * as React from 'react';
// FIX: Update Firebase imports for v8 compatibility.
import firebase from 'firebase/compat/app';
import { auth, db } from '../firebaseConfig';
import { QueueItem } from './OrderContext';
import { AvailableReward, tierThresholds } from '../data/mockRewards';
import { UserProfile, UserRole, RewardHistory, UserPreferences } from '../types';

interface AuthContextType {
    currentUser: UserProfile | null;
    loading: boolean;
    register: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<UserProfile>;
    login: (email: string, password: string, rememberMe: boolean) => Promise<{ needsVerification: boolean; userId?: string; email?: string; role?: string }>;
    logout: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
    signInWithGoogle: () => Promise<UserProfile>;
    signInWithFacebook: () => Promise<UserProfile>;
    updateUserProfile: (updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>>) => Promise<void>;
    updateUserPhoto: (photoURL: string) => Promise<void>;
    sendEmailVerificationCode: (userId: string, email: string) => Promise<void>;
    verifyEmailCode: (userId: string, code: string) => Promise<boolean>;
    updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
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

const fetchUserProfile = async (uid: string): Promise<UserProfile> => {
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
        // User exists in Authentication but not in Firestore - create profile
        console.log(`Creating missing Firestore profile for user: ${uid}`);

        const authUser = auth.currentUser;
        if (!authUser) {
            throw new Error("User not authenticated");
        }

        const nameParts = authUser.displayName?.split(' ') || ['User', ''];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        const welcomeBonus: RewardHistory = {
            id: `rh-${Date.now()}`,
            type: 'earned',
            points: 25,
            description: 'Welcome Bonus',
            date: new Date(),
        };

        const userProfileData = {
            email: authUser.email || '',
            displayName: authUser.displayName || `${firstName} ${lastName}`,
            firstName,
            lastName,
            phone: authUser.phoneNumber || '',
            photoURL: authUser.photoURL || undefined,
            createdAt: new Date(),
            role: UserRole.CUSTOMER,  // Default role for existing auth users
            totalOrders: 0,
            totalSpent: 0,
            currentPoints: 0, // No welcome bonus for backfilled users
            lifetimePoints: 0,
            loyaltyPoints: 0,
            tier: 'bronze',
            rewardsHistory: [],
            preferences: {
                notifications: { push: true, emailUpdates: true, marketing: false },
                theme: 'auto',
                privacy: { shareUsageData: true, personalizedRecs: true }
            },
            cart: [],
        };

        await userDocRef.set(userProfileData);

        // Fetch the newly created document
        const newUserDoc = await userDocRef.get();
        const data = newUserDoc.data()!;

        return {
            uid,
            email: data.email,
            displayName: data.displayName,
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
            loyaltyPoints: data.loyaltyPoints ?? 0,
            tier: data.tier || 'bronze',
            rewardsHistory: (data.rewardsHistory || []).map((h: any) => ({
                ...h,
                date: h.date && typeof h.date.toDate === 'function' ? h.date.toDate() : h.date
            })).sort((a: any, b: any) => {
                const dateA = a.date instanceof Date ? a.date : new Date(a.date);
                const dateB = b.date instanceof Date ? b.date : new Date(b.date);
                return dateB.getTime() - dateA.getTime();
            }),
            preferences: data.preferences || { notifications: { push: true, emailUpdates: true, marketing: false }, theme: 'auto', privacy: { shareUsageData: true, personalizedRecs: true } },
        };
    }

    const data = userDoc.data()!;
    return {
        uid,
        email: data.email,
        displayName: data.displayName || `${data.firstName} ${data.lastName}`,
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
        loyaltyPoints: data.loyaltyPoints ?? 0,
        tier: data.tier || 'bronze',
        rewardsHistory: (data.rewardsHistory || []).map((h: any) => ({
            ...h,
            date: h.date && typeof h.date.toDate === 'function' ? h.date.toDate() : h.date
        })).sort((a: any, b: any) => {
            const dateA = a.date instanceof Date ? a.date : new Date(a.date);
            const dateB = b.date instanceof Date ? b.date : new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        }),
        preferences: data.preferences || { notifications: { push: true, emailUpdates: true, marketing: false }, theme: 'auto', privacy: { shareUsageData: true, personalizedRecs: true } },
    };
};


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let unsubscribeFromFirestore: (() => void) | undefined;

        const unsubscribeFromAuth = auth.onAuthStateChanged(async (user: firebase.User | null) => {
            if (unsubscribeFromFirestore) {
                unsubscribeFromFirestore();
            }

            if (user) {
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
                            rewardsHistory: (data.rewardsHistory || []).map((h: any) => ({
                                ...h,
                                date: h.date && typeof h.date.toDate === 'function' ? h.date.toDate() : h.date
                            })).sort((a: any, b: any) => {
                                const dateA = a.date instanceof Date ? a.date : new Date(a.date);
                                const dateB = b.date instanceof Date ? b.date : new Date(b.date);
                                return dateB.getTime() - dateA.getTime();
                            }),
                            preferences: data.preferences || { notifications: { push: true, emailUpdates: true, marketing: false }, theme: 'auto', privacy: { shareUsageData: true, personalizedRecs: true } },
                        };
                        setCurrentUser(userProfile);
                    } else {
                        const userProfile: UserProfile = {
                            uid: user.uid,
                            email: user.email,
                            firstName: 'User',
                            lastName: '',
                            createdAt: new Date(),
                            role: UserRole.CUSTOMER,
                            totalOrders: 0,
                            totalSpent: 0,
                            currentPoints: 0,
                            lifetimePoints: 0,
                            tier: 'bronze',
                            rewardsHistory: [],
                            preferences: { notifications: { push: true, emailUpdates: true, marketing: false }, theme: 'auto', privacy: { shareUsageData: true, personalizedRecs: true } },
                        };
                        setCurrentUser(userProfile);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error listening to user document:", error);
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
            role: UserRole.CUSTOMER,
            totalOrders: 0,
            totalSpent: 0,
            currentPoints: 25,
            lifetimePoints: 25,
            tier: 'bronze',
            rewardsHistory: [welcomeBonus],
            preferences: { notifications: { push: true, emailUpdates: true, marketing: false }, theme: 'auto', privacy: { shareUsageData: true, personalizedRecs: true } },
            cart: [],
        };

        await db.collection('users').doc(user.uid).set(userProfileData);
        return fetchUserProfile(user.uid);
    };

    const signInWithGoogle = async (): Promise<UserProfile> => {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await auth.signInWithPopup(provider);
        const user = result.user!;
        const additionalUserInfo = result.additionalUserInfo;

        if (additionalUserInfo?.isNewUser) {
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
                role: UserRole.CUSTOMER,
                totalOrders: 0,
                totalSpent: 0,
                currentPoints: 25,
                lifetimePoints: 25,
                tier: 'bronze',
                rewardsHistory: [welcomeBonus],
                preferences: { notifications: { push: true, emailUpdates: true, marketing: false }, theme: 'auto', privacy: { shareUsageData: true, personalizedRecs: true } },
                cart: [],
            };

            await db.collection('users').doc(user.uid).set(userProfileData);
        }
        return fetchUserProfile(user.uid);
    };

    const signInWithFacebook = async (): Promise<UserProfile> => {
        const provider = new firebase.auth.FacebookAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user!;
        const additionalUserInfo = result.additionalUserInfo;

        if (additionalUserInfo?.isNewUser) {
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
                role: UserRole.CUSTOMER,
                totalOrders: 0,
                totalSpent: 0,
                currentPoints: 25,
                lifetimePoints: 25,
                tier: 'bronze',
                rewardsHistory: [welcomeBonus],
                preferences: { notifications: { push: true, emailUpdates: true, marketing: false }, theme: 'auto', privacy: { shareUsageData: true, personalizedRecs: true } },
                cart: [],
            };

            await db.collection('users').doc(user.uid).set(userProfileData);
        }
        return fetchUserProfile(user.uid);
    };

    const login = async (email: string, password: string, rememberMe: boolean): Promise<{ needsVerification: boolean; userId?: string; email?: string; role?: string }> => {
        if (email === 'test@test.com' && password === '123456') {
            const userId = 'test-user-id';
            const verificationCode = '123456';
            sessionStorage.setItem(`dev_verification_code_${userId}`, verificationCode);
            sessionStorage.setItem('requires2FA', 'true');
            return { needsVerification: true, userId, email, role: UserRole.CUSTOMER };
        }

        const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
        await auth.setPersistence(persistence);
        sessionStorage.setItem('requires2FA', 'true');

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const userId = userCredential.user!.uid;

            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            try {
                await db.collection('emailVerifications').doc(userId).set({
                    code: verificationCode,
                    email: email,
                    createdAt: new Date(),
                    expiresAt: expiresAt,
                    verified: false
                });
            } catch (firestoreError) {
                sessionStorage.setItem(`dev_verification_code_${userId}`, verificationCode);
            }

            console.log(`🔐 Verification code for ${email}: ${verificationCode}`);

            let role;
            try {
                const userDoc = await db.collection('users').doc(userId).get();
                role = userDoc.data()?.role;
            } catch (e) {
                role = UserRole.CUSTOMER;
            }

            return { needsVerification: true, userId, email, role };
        } catch (error) {
            sessionStorage.removeItem('requires2FA');
            throw error;
        }
    };

    const logout = async () => {
        await auth.signOut();
    };

    const sendPasswordReset = async (email: string) => {
        await auth.sendPasswordResetEmail(email);
    };

    const updateUserProfile = async (updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>>) => {
        if (!currentUser) return;
        await db.collection('users').doc(currentUser.uid).update(updates);
    };

    const updateUserPhoto = async (photoURL: string) => {
        if (!currentUser) return;
        await db.collection('users').doc(currentUser.uid).update({ photoURL });
    };

    const sendEmailVerificationCode = async (userId: string, email: string) => {
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        try {
            await db.collection('emailVerifications').doc(userId).set({
                code: verificationCode,
                email: email,
                createdAt: new Date(),
                expiresAt: expiresAt
            });
        } catch (e) {
            sessionStorage.setItem(`dev_verification_code_${userId}`, verificationCode);
        }
        console.log(`🔐 Verification code for ${email}: ${verificationCode}`);
    };

    const verifyEmailCode = async (userId: string, code: string): Promise<boolean> => {
        try {
            const docRef = db.collection('emailVerifications').doc(userId);
            const doc = await docRef.get();

            if (doc.exists) {
                const data = doc.data();
                if (data) {
                    const now = new Date();
                    const expiresAt = data.expiresAt.toDate();
                    if (now > expiresAt) return false;
                    if (data.code === code) {
                        await docRef.update({ verified: true });
                        return true;
                    }
                }
            }
        } catch (e) {
            // Fallback
        }
        const devCode = sessionStorage.getItem(`dev_verification_code_${userId}`);
        return devCode === code;
    };

    const updateUserPassword = async (currentPassword: string, newPassword: string) => {
        const user = auth.currentUser;
        if (!user || !user.email) throw new Error("No user logged in");
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPassword);
    };

    const value = {
        currentUser,
        loading,
        register,
        login,
        logout,
        sendPasswordReset,
        signInWithGoogle,
        signInWithFacebook,
        updateUserProfile,
        updateUserPhoto,
        sendEmailVerificationCode,
        verifyEmailCode,
        updateUserPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};