import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase"; // Assuming we have a mobile supabase client
import { Ionicons } from "@expo/vector-icons";
import { Filter } from "bad-words";
import { formatDistanceToNow } from "date-fns";

// We need a way to get Current User in mobile. 
// Assuming we haven't built full Mobile Auth UI yet, this part usually blocks.
// However, the Phase 5/6 plan mentioned Auth was "In Progress".
// I'll assume we can get session. If not, I'll show a "Login Required" text.

export default function InteractScreen() {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);
    const filter = new Filter();

    useEffect(() => {
        // Check Session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Fetch History
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('chat_messages')
                .select('*, profiles(username, full_name)')
                .order('created_at', { ascending: false })
                .limit(50);

            if (data) {
                setMessages(data.reverse());
                setTimeout(() => flatListRef.current?.scrollToEnd(), 500);
            }
            setLoading(false);
        };

        fetchMessages();

        // Subscribe
        const channel = supabase
            .channel('mobile_chat')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                async (payload) => {
                    const newMsg = payload.new;
                    // Fetch profile
                    const { data: userData } = await supabase
                        .from('profiles')
                        .select('username, full_name')
                        .eq('id', newMsg.user_id)
                        .single();

                    const msgWithProfile = { ...newMsg, profiles: userData };
                    setMessages(prev => [...prev, msgWithProfile]);
                    setTimeout(() => flatListRef.current?.scrollToEnd(), 200);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleSend = async () => {
        if (!newMessage.trim() || !user) return;

        if (filter.isProfane(newMessage)) {
            alert("Please keep the chat clean!");
            return;
        }

        const text = newMessage;
        setNewMessage("");

        const { error } = await supabase.from('chat_messages').insert({
            user_id: user.id,
            content: text
        });

        if (error) {
            console.error(error);
            alert("Failed to send");
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator color="#ef4444" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black" edges={['top']}>
            <View className="p-4 border-b border-zinc-800">
                <Text className="text-white text-2xl font-bold">Community Chat</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                renderItem={({ item }) => {
                    const isMe = user?.id === item.user_id;
                    return (
                        <View className={`mb-4 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <View className={`max-w-[80%] rounded-lg p-3 ${isMe ? 'bg-red-500' : 'bg-zinc-800'
                                }`}>
                                {!isMe && (
                                    <Text className="text-xs font-bold text-zinc-400 mb-1">
                                        {item.profiles?.username || "Anon"}
                                    </Text>
                                )}
                                <Text className={`text-base ${isMe ? 'text-white' : 'text-zinc-200'}`}>
                                    {item.content}
                                </Text>
                            </View>
                        </View>
                    );
                }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
                <View className="p-4 bg-zinc-900 border-t border-zinc-800 flex-row items-center">
                    {user ? (
                        <>
                            <TextInput
                                className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-2 mr-2"
                                placeholder="Type a message..."
                                placeholderTextColor="#71717a"
                                value={newMessage}
                                onChangeText={setNewMessage}
                            />
                            <TouchableOpacity onPress={handleSend} className="bg-red-500 p-2 rounded-full">
                                <Ionicons name="send" size={20} color="white" />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <Text className="text-zinc-500 w-full text-center">Login to chat</Text>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
