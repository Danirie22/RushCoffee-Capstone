export enum UserRole {
    ADMIN = 'admin',
    EMPLOYEE = 'employee',
    CUSTOMER = 'customer'
}

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
    role?: UserRole | 'customer' | 'employee' | 'admin'; // Keeping string union for backward compatibility during migration
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

export interface Review {
    comment: string;
    rating: number;
    userId?: string;
    status: 'published' | 'pending' | 'rejected';
    createdAt?: any; // Firestore timestamp
}

export interface Testimonial {
    quote: string;
    name: string;
    title: string;
    initial: string;
    avatarBg: string;
    avatarText: string;
    rating: number;
    photoURL: string | null;
}

export interface Customizations {
    sugarLevel?: string;
    iceLevel?: string;
    toppings?: string[];
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    customizations?: Customizations;
    size?: string;
    sizeLabel?: string;
    category?: string;
}

export interface Order {
    id: string; // Firestore document ID
    userId: string;
    customerName: string;
    orderNumber: string;
    position: number;
    status: 'waiting' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    orderItems: OrderItem[];
    totalAmount: number;
    paymentMethod: 'gcash' | 'cash';
    paymentStatus: 'pending' | 'paid' | 'failed';
    receiptUrl?: string;
    paymentReference?: string;
    paymentAccountName?: string;
    timestamp: Date;
    estimatedTime: number; // in minutes
    cancellationReason?: string;
    orderType?: 'online' | 'walk-in';
    completedAt?: any; // Firestore timestamp
    updatedAt?: any; // Firestore timestamp

    // POS / Extra fields
    subtotal?: number;
    paymentDetails?: {
        amountReceived: number;
        change: number;
        referenceNumber?: string;
    };
    discount?: {
        type: 'senior' | 'pwd' | 'none';
        amount: number;
        percentage: number;
        cardId?: string;
    } | null;
    employeeId?: string;
    employeeName?: string;
    inventoryDeducted?: boolean;
    customerId?: string; // Legacy support
}

export interface PaymentDetails {
    method: 'cash' | 'gcash';
    amount: number;
    amountReceived: number;
    change: number;
    referenceNumber?: string;
}
