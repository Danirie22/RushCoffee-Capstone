import React, { createContext, useContext, ReactNode } from 'react';

interface ReCaptchaContextType {
    executeRecaptcha: () => Promise<string | null>;
}

const ReCaptchaContext = createContext<ReCaptchaContextType | undefined>(undefined);

export const useReCaptcha = () => {
    const context = useContext(ReCaptchaContext);
    if (!context) {
        // Return a dummy implementation if provider is missing to prevent crashes
        return { executeRecaptcha: async () => "mock-token" };
    }
    return context;
};

export const ReCaptchaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const executeRecaptcha = async () => {
        console.log("ReCaptcha executed (mock)");
        return "mock-recaptcha-token";
    };

    return (
        <ReCaptchaContext.Provider value={{ executeRecaptcha }}>
            {children}
        </ReCaptchaContext.Provider>
    );
};
