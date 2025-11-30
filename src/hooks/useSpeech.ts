import { useCallback } from 'react';

export const useSpeech = () => {
    const speak = useCallback((text: string) => {
        if (!('speechSynthesis' in window)) {
            console.warn('Text-to-speech not supported in this browser.');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Configure voice (optional - tries to find a female English voice for "crew" feel)
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice =>
            voice.name.includes('Google US English') ||
            voice.name.includes('Microsoft Zira') ||
            (voice.lang === 'en-US' && voice.name.includes('Female'))
        );

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.rate = 1.1; // Slightly faster for a natural flow
        utterance.pitch = 1.1; // Slightly higher pitch for friendliness
        utterance.volume = 1.0;

        window.speechSynthesis.speak(utterance);
    }, []);

    return { speak };
};
