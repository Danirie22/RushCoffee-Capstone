import { useState, useEffect } from 'react';
import { fetchCustomizationOptions } from '../utils/seedCustomizationOptions';
import { mockCustomizationOptions, SugarLevel, IceLevel } from '../data/mockCustomizationOptions';

export interface CustomizationOptionsData {
    sugarLevels: SugarLevel[];
    iceLevels: IceLevel[];
}

/**
 * Custom hook to fetch customization options (sugar/ice levels) from Firestore
 */
export const useCustomizationOptions = () => {
    const [options, setOptions] = useState<CustomizationOptionsData>(mockCustomizationOptions);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadOptions = async () => {
            try {
                setIsLoading(true);
                const data = await fetchCustomizationOptions();

                if (data && data.sugarLevels && data.iceLevels) {
                    setOptions(data as CustomizationOptionsData);
                    setError(null);
                } else {
                    // Use mock data if structure is invalid
                    setOptions(mockCustomizationOptions);
                }
            } catch (err) {
                console.error('Error fetching customization options:', err);
                setError('Failed to load customization options');
                // Fallback to mock data
                setOptions(mockCustomizationOptions);
            } finally {
                setIsLoading(false);
            }
        };

        loadOptions();
    }, []);

    return { options, isLoading, error };
};
