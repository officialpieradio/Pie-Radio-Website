"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Send, User as UserIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Filter } from "bad-words";

interface ChatMessage {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles?: {
        username: string;
        full_name: string;
    };
    // We need to fetch profiles. In a real app we'd join. 
    // For realtime, we might only get the new row (no join). 
    // So we might need to fetch the user profile for the new message or just show "User".
    // Actually, standard pattern: 
    // 1. Initial Load: Select *, profiles(username)
    // 2. Realtime: Receive new row. Fetch profile for that user_id OR optimistic update if we knew the user (current user).
}

export function ChatBox() {
    const { user, profile } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const supabase = createClient();
    const filter = new Filter();

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        // 1. Fetch History
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('chat_messages')
                .select('*, profiles(username, full_name)')
                .order('created_at', { ascending: false })
                .limit(50);

            if (data) {
                setMessages(data.reverse() as any);
                setTimeout(scrollToBottom, 100);
            }
        };

        fetchMessages();

        // 2. Subscribe
        const channel = supabase
            .channel('public:chat_messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages'
                },
                async (payload) => {
                    const newMsg = payload.new as ChatMessage;

                    // Fetch profile for the new message sender
                    const { data: userData } = await supabase
                        .from('profiles')
                        .select('username, full_name')
                        .eq('id', newMsg.user_id)
                        .single();

                    const msgWithProfile = {
                        ...newMsg,
                        profiles: userData
                    } as any;

                    setMessages((prev) => [...prev, msgWithProfile]);
                    setTimeout(scrollToBottom, 100);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        if (filter.isProfane(newMessage)) {
            alert("Please keep the chat clean!");
            return;
        }

        setSending(true);
        const text = newMessage;
        setNewMessage(""); // Optimistic clear

        const { error } = await supabase
            .from('chat_messages')
            .insert({
                user_id: user.id,
                content: text
            });

        if (error) {
            console.error("Failed to send", error);
            setNewMessage(text); // Restore on error
        }
        setSending(false);
    };

    return (
        <div className="flex flex-col h-[600px] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-950">
                <h3 className="font-bold text-white flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Live Chat
                </h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="text-center text-zinc-500 mt-20">
                        <p>No messages yet. Say hello! 👋</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = user?.id === msg.user_id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-zinc-800 text-zinc-200'
                                }`}>
                                {!isMe && (
                                    <p className="text-xs font-bold mb-1 text-zinc-400">
                                        {msg.profiles?.username || "Anonymous"}
                                    </p>
                                )}
                                <p className="text-sm break-words">{msg.content}</p>
                                <p className="text-[10px] opacity-50 text-right mt-1">
                                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950">
                {user ? (
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sending}
                        />
                        <Button size="icon" type="submit" disabled={sending || !newMessage.trim()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                ) : (
                    <div className="text-center">
                        <p className="text-sm text-zinc-500 mb-2">Login to chat with the community</p>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/login">Sign In</a>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
