import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceSearchProps {
    onSearch: (term: string) => void;
    onCommand: (command: string, term: string) => void;
    language?: string;
}

declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

const DEMO_TOOLTIP_DURATION = 5000;
const HINTS = [
    "Try saying 'Order Spanish Latte'",
    "Say 'Show me Meals'",
    "Try 'Order Iced Latte'",
    "Say 'Matcha Series'"
];

const VoiceSearch: React.FC<VoiceSearchProps> = ({ onSearch, onCommand, language = 'en-US' }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef<any>(null);
    const [hintIndex, setHintIndex] = useState(0);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = language;

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            setError(null);
            setHintIndex(0); // Reset hint cycle
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log('Voice result:', transcript);
            processResult(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
            if (event.error === 'network') {
                if (language === 'tl-PH') {
                    setError('Tagalog mode requires internet.');

                } else {
                    setError('Network error. Check internet or permissions.');

                }
            } else if (event.error === 'not-allowed') {
                setError('Mic access denied.');

            } else if (event.error === 'no-speech') {
                setError('No speech detected.');
                // Don't speak here to avoid annoyance if they just clicked and didn't say anything
            } else {
                setError('Voice error. Try again.');

            }
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [language]);

    // Hint Cycling Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isListening) {
            interval = setInterval(() => {
                setHintIndex((prev) => (prev + 1) % HINTS.length);
            }, 2500); // Change hint every 2.5 seconds
        }
        return () => clearInterval(interval);
    }, [isListening]);

    const processResult = (text: string) => {
        const lowerText = text.toLowerCase().trim();

        // Simple command parsing
        // "I want [item]" or "Gusto ko ng [item]"
        const orderCommands = [
            'i want', 'order', 'get me', 'can i have', 'add', 'add to cart', // English
            'show me', 'show me the', 'go to', 'view', 'open', // Navigation/View
            'gusto ko ng', 'gusto ko', 'pabili ng', 'order ako ng', 'dagdag', // Tagalog Order
            'patingin ng', 'patingin sa', 'punta sa', 'buksan' // Tagalog Navigation
        ];

        // Common fillers to ignore at the end of sentences
        const fillers = [
            'pre', 'pare', 'tol', 'boss', 'idol', 'po', 'opo', 'please', 'naman', 'sana', 'thanks', 'thank you',
            'cart', 'sa', 'to', 'ng', 'the', 'my', 'ko', 'mo'
        ];

        let isCommand = false;
        for (const cmd of orderCommands) {
            // Check if the command exists anywhere in the sentence
            if (lowerText.includes(cmd)) {
                // Split by the command and take the part AFTER it
                const parts = lowerText.split(cmd);
                if (parts.length > 1) {
                    let term = parts[1].trim();

                    // Remove trailing punctuation
                    term = term.replace(/[.,?!]+$/, '');

                    // Remove common fillers from the end (loop to remove multiple)
                    let words = term.split(/\s+/); // Split by any whitespace
                    while (words.length > 0 && fillers.includes(words[words.length - 1])) {
                        words.pop();
                    }
                    term = words.join(' ');

                    if (term) {
                        onCommand('order', term);
                        isCommand = true;
                        break;
                    }
                }
            }
        }

        if (!isCommand) {
            // Treat as search
            let cleanText = lowerText.replace(/[.,?!]+$/, '');

            // Also remove fillers from direct search terms
            let words = cleanText.split(/\s+/);
            while (words.length > 0 && fillers.includes(words[words.length - 1])) {
                words.pop();
            }
            cleanText = words.join(' ');

            onSearch(cleanText);
        }
    };

    const toggleListening = () => {
        setError(null);
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            if (!navigator.onLine) {
                setError('No Internet Connection');
                return;
            }
            recognitionRef.current?.start();
        }
    };

    const [showDemoTooltip, setShowDemoTooltip] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowDemoTooltip(false);
        }, DEMO_TOOLTIP_DURATION);

        return () => clearTimeout(timer);
    }, []);

    if (!isSupported) return null;

    return (
        <div className="relative w-12 h-12 flex items-center justify-center z-20">
            <button
                onClick={toggleListening}
                className={`relative flex h-full w-full items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 ${isListening
                    ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
                    : error
                        ? 'bg-red-500/20 text-red-500 ring-1 ring-red-500/50'
                        : 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20'
                    }`}
                title={error || (isListening ? 'Listening...' : 'Voice Search')}
            >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}

                {/* Pulse ring effect when listening */}
                {isListening && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                )}
            </button>

            {/* Hint Tooltip (Only when listening) */}
            {isListening && !error && (
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div className="animate-fade-in bg-gray-900/90 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap backdrop-blur-md border border-white/10">
                        {HINTS[hintIndex]}
                        {/* Upward pointing arrow */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900/90"></div>
                    </div>
                </div>
            )}

            {/* Error Tooltip */}
            {error && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-red-500 px-2 py-1 text-[10px] font-medium text-white shadow-lg z-50">
                    {error}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-red-500"></div>
                </div>
            )}

            {/* Demo Tooltip - Auto-hide */}
            {showDemoTooltip && !isListening && !error && (
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div className="animate-bounce">
                        <div className="bg-primary-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                            Try voice search!
                        </div>
                        {/* Upward pointing arrow */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-primary-600"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceSearch;
