import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Minimize2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    action?: {
        label: string;
        path: string;
    };
}

const ChatBot: React.FC = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem('chat_history');
        if (saved) {
            return JSON.parse(saved, (key, value) => {
                if (key === 'timestamp') return new Date(value);
                return value;
            });
        }
        return [{
            id: '1',
            text: "Hello, welcome to Rush Coffee! ☕ I'm Rush Bot. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
        }];
    });
    const [isTyping, setIsTyping] = useState(false);
    const [showGreeting, setShowGreeting] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const quickReplies = [
        { id: 2, text: "⏰ Store Hours", message: "hours" },
        { id: 4, text: "📍 Location", message: "location" },
        { id: 5, text: "📞 Contact Us", message: "contact" },
        { id: 7, text: "💳 Payment Methods", message: "payment" }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        localStorage.setItem('chat_history', JSON.stringify(messages));
    }, [messages, isTyping]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowGreeting(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (showGreeting) {
            const autoDismissTimer = setTimeout(() => {
                setShowGreeting(false);
            }, 5000);

            return () => clearTimeout(autoDismissTimer);
        }
    }, [showGreeting]);

    const handleOpen = () => {
        setIsOpen(!isOpen);
        setShowGreeting(false);
    };

    const handleQuickReply = (message: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            text: message,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        setTimeout(() => {
            const response = generateResponse(message);
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: response.text,
                sender: 'bot',
                timestamp: new Date(),
                action: response.action
            };
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 1000);
    };

    const generateResponse = (input: string): { text: string; action?: { label: string; path: string } } => {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
            return { text: "Hello! Welcome to Rush Coffee. What can I get for you? ☕" };
        }
        if (lowerInput.includes('menu') || lowerInput.includes('order') || lowerInput.includes('drink') || lowerInput.includes('food')) {
            return {
                text: "You can explore our delicious menu by clicking the button below. We have Coffee, Non-Coffee, Matcha, and Meals! 🍔☕",
                action: { label: "📋 See Menu", path: "/menu" }
            };
        }
        if (lowerInput.includes('hours') || lowerInput.includes('open') || lowerInput.includes('close') || lowerInput.includes('time')) {
            return { text: "We are open daily from 7:00 AM to 10:00 PM. See you soon! 🕙" };
        }
        if (lowerInput.includes('location') || lowerInput.includes('where') || lowerInput.includes('address')) {
            return { text: "We are located at 11 Visayan Ave. St. Galas, Quezon City, Philippines. Come visit us for a fresh brew! 📍" };
        }
        if (lowerInput.includes('recommend') || lowerInput.includes('best') || lowerInput.includes('suggestion')) {
            return {
                text: "I highly recommend our signature Spanish Latte! 🌟 It's a customer favorite. If you love matcha, our Dirty Matcha is a must-try!",
                action: { label: "⭐ View Recommendations", path: "/menu" }
            };
        }
        if (lowerInput.includes('contact') || lowerInput.includes('call') || lowerInput.includes('phone') || lowerInput.includes('email')) {
            return { text: "You can reach us at 0912-345-6789 or email us at hello@rushcoffee.com. We'd love to hear from you! 📞" };
        }
        if (lowerInput.includes('bestseller') || lowerInput.includes('best') || lowerInput.includes('favorite') || lowerInput.includes('popular')) {
            return {
                text: "Our customer favorites are the Spanish Latte, Dirty Matcha, and Caramel Macchiato! 🌟 You have to try them!",
                action: { label: "🛒 Order Now", path: "/menu" }
            };
        }
        if (lowerInput.includes('payment') || lowerInput.includes('pay') || lowerInput.includes('gcash') || lowerInput.includes('cash')) {
            return { text: "We only accept Over-the-Counter Cash payments at the moment. 💵" };
        }
        if (lowerInput.includes('thank')) {
            return { text: "You're welcome! Let me know if you need anything else. 😊" };
        }
        if (lowerInput.includes('bye')) {
            return { text: "Goodbye! Have a wonderful day! 👋" };
        }

        return { text: "I'm not sure about that, but I'd love to help! You can ask me about our menu, opening hours, or location." };
    };

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        setTimeout(() => {
            const response = generateResponse(userMessage.text);
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: response.text,
                sender: 'bot',
                timestamp: new Date(),
                action: response.action
            };
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {showGreeting && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="pointer-events-auto mb-4 mr-2 max-w-[200px] cursor-pointer rounded-2xl rounded-br-none bg-white p-4 shadow-xl dark:bg-gray-800"
                        onClick={handleOpen}
                    >
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowGreeting(false);
                                }}
                                className="absolute -right-2 -top-2 rounded-full bg-gray-100 p-1 hover:bg-gray-200 dark:bg-gray-700"
                            >
                                <X className="h-3 w-3 text-gray-500" />
                            </button>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                                Hello, welcome to Rush Coffee! ☕ I'm Rush Bot.
                            </p>
                        </div>
                    </motion.div>
                )}

                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="pointer-events-auto mb-4 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-md dark:bg-gray-900/90 sm:w-[380px]"
                    >
                        <div className="flex items-center justify-between bg-primary-600 px-4 py-3 text-white">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                    <MessageCircle className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Rush Assistant</h3>
                                    <p className="text-[10px] text-primary-100 flex items-center gap-1">
                                        <span className="block h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-1 hover:bg-white/20 transition-colors"
                            >
                                <Minimize2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.sender === 'user'
                                            ? 'bg-primary-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                            }`}
                                    >
                                        <p>{msg.text}</p>
                                        {msg.action && (
                                            <button
                                                onClick={() => {
                                                    navigate(msg.action!.path);
                                                    setIsOpen(false);
                                                }}
                                                className="mt-2 flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors w-full justify-center border border-primary-100"
                                            >
                                                {msg.action.label}
                                                <ExternalLink className="h-3 w-3" />
                                            </button>
                                        )}
                                        <p className={`mt-1 text-[9px] ${msg.sender === 'user' ? 'text-primary-100' : 'text-gray-400'
                                            }`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Reply Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border-t border-gray-100 bg-white p-2"
                        >
                            <p className="text-[10px] font-semibold text-gray-600 mb-2">Quick Actions</p>
                            <div className="flex flex-wrap gap-1.5">
                                {quickReplies.map((reply) => (
                                    <motion.button
                                        key={reply.id}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleQuickReply(reply.message)}
                                        className="px-3 py-1.5 text-[10px] font-semibold text-primary-700 bg-white border-2 border-primary-200 rounded-full hover:bg-primary-50 hover:border-primary-400 transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        {reply.text}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>

                        <form onSubmit={handleSend} className="border-t-2 border-primary-200 bg-gray-50 p-3 shadow-inner">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 rounded-full border-2 border-primary-200 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative flex items-center justify-center">
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                        className="absolute h-14 w-14 rounded-full bg-primary-500/30"
                    />
                )}

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleOpen}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full shadow-xl shadow-primary-600/20 transition-all duration-300 ${isOpen
                        ? 'bg-gray-800 text-white rotate-90'
                        : 'bg-gradient-to-br from-primary-600 to-primary-500 text-white hover:shadow-2xl hover:shadow-primary-600/30'
                        }`}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X className="h-6 w-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="chat"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <MessageCircle className="h-7 w-7" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </div>
    );
};

export default ChatBot;
