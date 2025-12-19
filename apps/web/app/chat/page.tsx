import { ChatBox } from "@/components/chat/chat-box";

export default function ChatPage() {
    return (
        <div className="container max-w-lg mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-white mb-6">Community Chat</h1>
            <ChatBox />
        </div>
    );
}
