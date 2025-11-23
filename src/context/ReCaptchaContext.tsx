import React, { createContext, useContext } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// For development, we'll use a test site key
// In production, replace this with your actual reCAPTCHA v3 site key
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

interface ReCaptchaContextType {
    executeRecaptcha: (action: string) => Promise<string>;
}

const ReCaptchaContext = createContext<ReCaptchaContextType | undefined>(undefined);

export const useReCaptcha = () => {
    const context = useContext(ReCaptchaContext);
    if (!context) {
        // Return a silent fallback - provider will load soon
        return {
            executeRecaptcha: async (action: string) => {
                return 'recaptcha-loading';
            }
        };
    }
    return context;
};

interface ReCaptchaProviderWrapperProps {
    children: React.ReactNode;
}

const ReCaptchaProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { executeRecaptcha: executeRecaptchaFromLib } = useGoogleReCaptcha();

    const executeRecaptcha = async (action: string): Promise<string> => {
        if (!executeRecaptchaFromLib) {
            // Silent - will be ready soon
            return 'recaptcha-not-loaded';
        }

        try {
            const token = await executeRecaptchaFromLib(action);
            return token;
        } catch (error) {
            console.error('reCAPTCHA execution error:', error);
            return 'recaptcha-error';
        }
    };

    return (
        <ReCaptchaContext.Provider value={{ executeRecaptcha }}>
            {children}
        </ReCaptchaContext.Provider>
    );
};

export const ReCaptchaProviderWrapper: React.FC<ReCaptchaProviderWrapperProps> = ({ children }) => {
    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={RECAPTCHA_SITE_KEY}
            scriptProps={{
                async: true,
                defer: true,
                appendTo: 'head',
            }}
        >
            <ReCaptchaProviderInner>
                {children}
            </ReCaptchaProviderInner>
        </GoogleReCaptchaProvider>
    );
};
