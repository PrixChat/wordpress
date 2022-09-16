import { useEffect, useState } from "react";
import { Conversation } from "../models";
import ConversationItem from "./ConversationItem";
import { usePrixContext } from "./PrixProvider";

export default function Conversations({
    search
}: {
    search: string
}) {
    const { conversations, setConversations } = usePrixContext();
    const [filtered, setFiltered] = useState<Conversation[]>([]);
    
    useEffect(() => {
        setConversations(conversations);

        const filtered = conversations.filter(conversation => {
            return conversation.title?.toLowerCase().includes(search.toLowerCase());
        });

        setFiltered([...filtered]);
    }, [conversations, search]);
    return (
        <nav className="conversations-list pc-thin-scrollbar">
            {filtered.map((conversation) => (
                <ConversationItem key={conversation.id} conversation={conversation} />
            ))}
        </nav>
    )
}