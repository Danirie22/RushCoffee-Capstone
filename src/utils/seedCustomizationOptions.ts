import { db } from '../firebaseConfig';
import { mockCustomizationOptions } from '../data/mockCustomizationOptions';

/**
 * Seeds customization options to Firestore
 * This should be called when the app initializes or from an admin page
 */
export const seedCustomizationOptions = async (): Promise<void> => {
    try {
        const customizationRef = db.collection('settings').doc('customizationOptions');

        // Check if already exists
        const doc = await customizationRef.get();

        if (!doc.exists) {
            console.log('Seeding customization options to Firestore...');
            await customizationRef.set(mockCustomizationOptions);
            console.log('✅ Customization options seeded successfully');
        } else {
            console.log('ℹ️ Customization options already exist in Firestore');
        }
    } catch (error) {
        console.error('❌ Error seeding customization options:', error);
        throw error;
    }
};

/**
 * Fetches customization options from Firestore
 */
export const fetchCustomizationOptions = async () => {
    try {
        const customizationRef = db.collection('settings').doc('customizationOptions');
        const doc = await customizationRef.get();

        if (doc.exists) {
            return doc.data();
        } else {
            // If not found, seed it first
            await seedCustomizationOptions();
            const newDoc = await customizationRef.get();
            return newDoc.data();
        }
    } catch (error) {
        console.error('Error fetching customization options:', error);
        // Fallback to mock data
        return mockCustomizationOptions;
    }
};
