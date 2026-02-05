import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { sendChat } from '@/services/api';

interface Message {
    role: 'bot' | 'user';
    text: string;
}

export function ChatbotView() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', text: "Hello! I'm CivicBot. I can help you with local laws, report status, or general questions. How can I assist?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [useDocs, setUseDocs] = useState(true);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const data = await sendChat(userMsg, useDocs);
            setMessages(prev => [...prev, { role: 'bot', text: data.reply || "I didn't catch that." }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting to the server." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 dark:text-slate-100">AI Assistant</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Powered by CivicFlow RAG</p>
                    </div>
                </div>

                {/* Toggle Mode */}
                <button
                    onClick={() => setUseDocs(!useDocs)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${useDocs
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-700'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                >
                    {useDocs ? <BookOpen className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {useDocs ? "Using Knowledge Base" : "General Chat"}
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/30">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'bot' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0 flex items-center justify-center mt-1">
                                <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        )}

                        <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 rounded-bl-none'
                            }`}>
                            {msg.text.split('\n').map((line, i) => (
                                <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                            ))}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center mt-1">
                                <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3 justify-start animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0"></div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl w-24 h-10"></div>
                    </div>
                )}
                <div ref={bottomRef}></div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about laws, issue status, or anything..."
                        className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                    AI can make mistakes. Verify important legal information.
                </p>
            </div>
        </div>
    );
}
