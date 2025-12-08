
import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../firebaseConfig'; // Added auth if needed, but db is main
import firebase from "firebase/compat/app";
import { Search, Send, User, Clock, Check, CheckCheck, MessageSquare, MoreVertical, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot' | 'admin';
    timestamp: any;
    read?: boolean;
}

interface Conversation {
    id: string;
    lastMessage: string;
    lastTimestamp: any;
    unreadCount: number;
    userId?: string;
    userName?: string;
    userEmail?: string;
    isGuest?: boolean;
}

const AdminMessagesPage: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [replyText, setReplyText] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch Conversations
    useEffect(() => {
        const unsubscribe = db.collection('conversations')
            .orderBy('lastTimestamp', 'desc')
            .onSnapshot((snapshot) => {
                const convos: Conversation[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    convos.push({
                        id: doc.id,
                        lastMessage: data.lastMessage || '',
                        lastTimestamp: data.lastTimestamp,
                        unreadCount: data.unreadCount || 0,
                        userId: data.userId,
                        userName: data.userName || 'Guest',
                        userEmail: data.userEmail,
                        isGuest: data.isGuest
                    });
                });
                setConversations(convos);
                setLoadingConversations(false);
            });

        return () => unsubscribe();
    }, []);

    // Fetch Messages for Selected Conversation
    useEffect(() => {
        if (!selectedConversationId) return;

        const unsubscribe = db.collection('conversations')
            .doc(selectedConversationId)
            .collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot((snapshot) => {
                const msgs: Message[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    msgs.push({
                        id: doc.id,
                        text: data.text,
                        sender: data.sender,
                        timestamp: data.timestamp,
                        read: data.read
                    });
                });
                setMessages(msgs);

                // Mark as read logic
                if (msgs.length > 0) {
                    const lastMsg = msgs[msgs.length - 1];
                    if (lastMsg.sender === 'user' && !lastMsg.read) {
                        // Use set with merge true or update
                        db.collection('conversations').doc(selectedConversationId).update({
                            unreadCount: 0
                        }).catch(err => console.error("Error marking read", err));
                    }
                }
            });

        return () => unsubscribe();
    }, [selectedConversationId]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedConversationId) return;

        const text = replyText;
        setReplyText('');

        try {
            // Add message
            await db.collection('conversations')
                .doc(selectedConversationId)
                .collection('messages')
                .add({
                    text,
                    sender: 'admin',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    read: false
                });

            // Update conversation
            await db.collection('conversations').doc(selectedConversationId).update({
                lastMessage: text,
                lastTimestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

        } catch (error) {
            console.error("Error sending reply:", error);
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return formatDistanceToNow(date, { addSuffix: true });
    };

    return (
        <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Left Sidebar: Conversations list */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loadingConversations ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No messages yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {conversations.map(convo => (
                                <div
                                    key={convo.id}
                                    onClick={() => setSelectedConversationId(convo.id)}
                                    className={`p-4 cursor-pointer hover:bg-white transition-colors ${selectedConversationId === convo.id ? 'bg-white border-l-4 border-primary-600' : ''
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                                                {convo.userName?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className={`font-semibold text-sm ${convo.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {convo.userName}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                            {formatTime(convo.lastTimestamp)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pl-10">
                                        <p className="text-xs text-gray-500 line-clamp-1 truncate pr-2">
                                            {convo.lastMessage}
                                        </p>
                                        {convo.unreadCount > 0 && (
                                            <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                                                {convo.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Main: Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedConversationId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                                    {conversations.find(c => c.id === selectedConversationId)?.userName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">
                                        {conversations.find(c => c.id === selectedConversationId)?.userName}
                                    </h3>
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                        Customer
                                    </p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] ${msg.sender === 'admin' ? 'order-1' : 'order-2'}`}>
                                        <div
                                            className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.sender === 'admin'
                                                    ? 'bg-primary-600 text-white rounded-br-none'
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                                }`}
                                        >
                                            <p>{msg.text}</p>
                                        </div>
                                        <div className={`flex items-center gap-1 mt-1 text-[10px] text-gray-400 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'
                                            }`}>
                                            <span>
                                                {msg.timestamp?.toDate
                                                    ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <form onSubmit={handleSendReply} className="flex gap-2">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type a reply..."
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!replyText.trim()}
                                    className="bg-primary-600 text-white rounded-lg px-4 py-2 hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    <span>Send</span>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMessagesPage;
