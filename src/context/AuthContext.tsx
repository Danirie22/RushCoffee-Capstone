
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
    displayName?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    photoURL?: string;
    createdAt: Date;
    role?: 'customer' | 'employee' | 'admin';
    loyaltyPoints?: number;
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
    register: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<UserProfile>;
    login: (email: string, password: string, rememberMe: boolean) => Promise<{ needsVerification: boolean; userId?: string; email?: string; role?: string }>;
    logout: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
    signInWithGoogle: () => Promise<UserProfile>;
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
            role: 'customer',  // Default role for existing auth users
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
                        console.log("User document not found for UID:", user.uid, " - Using fallback profile");
                        // Fallback profile
                        const userProfile: UserProfile = {
                            uid: user.uid,
                            email: user.email,
                            firstName: 'User',
                            lastName: '',
                            createdAt: new Date(),
                            role: 'customer',
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
                    console.error("Error listening to user document:", error, " - Using fallback profile");
                    // Fallback profile on error
                    const userProfile: UserProfile = {
                        uid: user.uid,
                        email: user.email,
                        firstName: 'User',
                        lastName: '',
                        createdAt: new Date(),
                        role: 'customer',
                        totalOrders: 0,
                        totalSpent: 0,
                        currentPoints: 0,
                        lifetimePoints: 0,
                        tier: 'bronze',
                        rewardsHistory: [],
                        preferences: { notifications: { push: true, emailUpdates: true, marketing: false }, theme: 'auto', privacy: { shareUsageData: true, personalizedRecs: true } },
                    };
                    setCurrentUser(userProfile);
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
            role: 'customer',  // All new users are customers by default
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
        return fetchUserProfile(user.uid);
    };

    const signInWithGoogle = async (): Promise<UserProfile> => {
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
                role: 'customer',  // Google Sign-In users are customers by default
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
        return fetchUserProfile(user.uid);
    };

    const login = async (email: string, password: string, rememberMe: boolean): Promise<{ needsVerification: boolean; userId?: string; email?: string; role?: string }> => {
        console.log('🟢 AuthContext.login called with:', { email, rememberMe });

        // MOCK LOGIN FOR DEV
        if (email === 'test@test.com' && password === '123456') {
            console.log('🟢 Using MOCK login for test user');
            const userId = 'test-user-id';
            const verificationCode = '123456';
            sessionStorage.setItem(`dev_verification_code_${userId}`, verificationCode);
            // Set 2FA flag
            sessionStorage.setItem('requires2FA', 'true');

            console.log(`🔐 Verification code for ${email}: ${verificationCode}`);
            return {
                needsVerification: true,
                userId: userId,
                email: email,
                role: 'customer'
            };
        }

        // FIX: Use firebase.auth.Auth.Persistence for v8.
        const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
        // FIX: Use auth.setPersistence for v8.
        await auth.setPersistence(persistence);

        console.log('🟢 Attempting Firebase authentication...');

        // Set 2FA flag BEFORE auth triggers to prevent UI flicker in Header
        sessionStorage.setItem('requires2FA', 'true');

        try {
            // FIX: Use auth.signInWithEmailAndPassword for v8.
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const userId = userCredential.user!.uid;

            console.log('🟢 Firebase auth successful, userId:', userId);

            // Generate 6-digit verification code
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            console.log('🟢 Storing verification code in Firestore...');

            try {
                // Store verification code in Firestore
                await db.collection('emailVerifications').doc(userId).set({
                    code: verificationCode,
                    email: email,
                    createdAt: new Date(),
                    expiresAt: expiresAt,
                    verified: false
                });
            } catch (firestoreError) {
                console.warn('⚠️ Firestore write failed (likely permission issue), falling back to sessionStorage for dev:', firestoreError);
                sessionStorage.setItem(`dev_verification_code_${userId}`, verificationCode);
            }

            // In production, send email here using SendGrid, AWS SES, etc.
            // For development, log the code
            console.log(`🔐 Verification code for ${email}: ${verificationCode}`);

            // Fetch user profile to get role
            let role;
            try {
                const userDoc = await db.collection('users').doc(userId).get();
                role = userDoc.data()?.role;
            } catch (e) {
                console.warn('Failed to fetch user role, defaulting to customer');
                role = 'customer';
            }

            console.log('🟢 Returning verification needed response with role:', role);

            // Return verification needed status (keep user signed in)
            return {
                needsVerification: true,
                userId: userId,
                email: email,
                role: role
            };
        } catch (error) {
            // Login failed, clear the flag so we don't block future auth states
            sessionStorage.removeItem('requires2FA');
            console.error('Login failed, cleared 2FA flag:', error);
            throw error;
        }
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

    const sendEmailVerificationCode = async (userId: string, email: string) => {
        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        try {
            // Store verification code in Firestore
            await db.collection('emailVerifications').doc(userId).set({
                code: verificationCode,
                email: email,
                createdAt: new Date(),
                expiresAt: expiresAt
            });
        } catch (e) {
            console.warn('Firestore write failed, using session storage fallback');
            sessionStorage.setItem(`dev_verification_code_${userId}`, verificationCode);
        }

        // In production, send email here using SendGrid, AWS SES, etc.
        // For development, log the code
        console.log(`🔐 Verification code for ${email}: ${verificationCode}`);
    };

    const verifyEmailCode = async (userId: string, code: string): Promise<boolean> => {
        try {
            const docRef = db.collection('emailVerifications').doc(userId);
            const doc = await docRef.get();

            if (doc.exists) {
                const data = doc.data();
                if (data) {
                    // Check expiration
                    const now = new Date();
                    const expiresAt = data.expiresAt.toDate();
                    if (now > expiresAt) {
                        console.error('Verification code expired');
                        return false;
                    }

                    // Check code match
                    if (data.code === code) {
                        // Mark as verified
                        await docRef.update({ verified: true });
                        return true;
                    }
                }
            }
        } catch (e) {
            console.warn('Firestore read failed, checking session storage fallback');
        }

        // Fallback to session storage for dev
        const devCode = sessionStorage.getItem(`dev_verification_code_${userId}`);
        if (devCode && devCode === code) {
            return true;
        }

        return false;
    };

    const updateUserPassword = async (currentPassword: string, newPassword: string) => {
        const user = auth.currentUser;
        if (!user || !user.email) throw new Error("No user logged in");

        // Re-authenticate user
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
        await user.reauthenticateWithCredential(credential);

        // Update password
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