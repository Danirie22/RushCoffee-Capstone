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

interface UserProfile {
    uid: string;
    email: string | null;
    firstName: string;
    lastName: string;
    phone?: string;
}

interface AuthContextType {
    currentUser: UserProfile | null;
    loading: boolean;
    register: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<void>;
    login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
    logout: () => Promise<void>;
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
                    setCurrentUser({
                        uid: user.uid,
                        email: user.email,
                        ...userDoc.data()
                    } as UserProfile);
                } else {
                     // This might happen if user is created but firestore doc fails.
                     // For now, we can set a basic profile.
                    setCurrentUser({
                        uid: user.uid,
                        email: user.email,
                        firstName: 'User',
                        lastName: '',
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

        const userProfileData: {
            firstName: string;
            lastName: string;
            email: string;
            phone?: string;
        } = {
            firstName,
            lastName,
            email,
        };

        if (phone) {
            userProfileData.phone = phone;
        }
        
        // Save user profile to Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, userProfileData);
    };

    const login = async (email: string, password: string, rememberMe: boolean) => {
        const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistence);
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        await signOut(auth);
    };

    const value = {
        currentUser,
        loading,
        register,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};