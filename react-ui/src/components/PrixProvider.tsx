import { createContext, SetStateAction, useContext, useEffect, useState } from "react";
import { Conversation, Message, ReplyTo } from "../models";
import { useExtendedState } from "../hooks/useExtendedState";
import prixData from "../variables";

type PrixContextType = {
    messages: Message[],
    setMessages: (messages: SetStateAction<Message[]>) => void,
    replyTo: ReplyTo | null,
    setReplyTo: (replyTo: ReplyTo | null) => void,
    conversations: Conversation[],
    setConversations: (conversations: Conversation[]) => void,
    activeConversation: Conversation,
    setActiveConversation: (activeConversation: Conversation) => void,
    dialogOpen: boolean,
    setDialogOpen: (dialogOpen: boolean) => void,
    selectedMessages: Message[],
    setSelectedMessages: (selectedMessages: Message[]) => void,
    totalUnread: number,
    setTotalUnread: (totalUnread: SetStateAction<number>) => void,
    search: string,
    setSearch: (search: SetStateAction<string>) => void,
    getSearch: () => Promise<string>,
}

const PrixContext = createContext({} as PrixContextType);

export function usePrixContext() {
    const context = useContext(PrixContext);

    if (!context) {
        throw new Error("usePrixContext must be used within a PrixProvider");
    }

    return context;
}

export function useChat(id?: number) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation>({} as Conversation);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState<Message[]>([]);
    const [totalUnread, setTotalUnread] = useState<number>(0);
    const [search, setSearch, getSearch] = useExtendedState('');

    useEffect(() => {
        const documentTitle = document.title;

        // Add total unread badge to wp menu
        if (totalUnread > 0) {
            document.title = `(${totalUnread}) ` + documentTitle;
            const spanElement = document.createElement('span');
            spanElement.className = 'unread-count';
            spanElement.innerHTML = totalUnread.toString();
            document.querySelector('#toplevel_page_prixchat > a > .wp-menu-name')?.append(spanElement);
        }

        // Play audio if there are unread messages
        const incomingMessagesSound = prixData.incomingMessagesSound;
        if (incomingMessagesSound.length > 10) {
            var audio = new Audio(incomingMessagesSound);

            if (totalUnread > 0) {
                var playPromise = audio.play();

                if (playPromise !== undefined) {
                    playPromise.then(_ => { }).catch(error => {
                        console.warn('🔇No interaction. Audio muted.');
                    });
                }
            }
        }

        return () => {
            document.title = documentTitle;
            document.querySelector('#toplevel_page_prixchat > a > .wp-menu-name > .unread-count')?.remove();
        }
    }, [totalUnread]);

    useEffect(() => {
        let initialUnread = 0;

        conversations.forEach(conversation => {
            if (typeof conversation.unread_count !== 'number') {
                conversation.unread_count = parseInt(conversation.unread_count as any);
            }

            initialUnread += conversation.unread_count ?? 0;
        });

        setTotalUnread(initialUnread);
    }, [conversations]);

    useEffect(() => {
        if (prixData.conversations) {
            setConversations(prixData.conversations);
        }
    }, [])

    return {
        messages,
        setMessages,
        replyTo,
        setReplyTo,
        conversations,
        setConversations,
        activeConversation,
        setActiveConversation,
        dialogOpen,
        setDialogOpen,
        selectedMessages,
        setSelectedMessages,
        totalUnread,
        setTotalUnread,
        search,
        setSearch,
        getSearch,
    };
}


export const PrixProvider = (props: {
    children: React.ReactNode,
}) => {
    const chat = useChat();

    return (
        <PrixContext.Provider
            value={chat}
        >
            {props.children}
        </PrixContext.Provider>
    );
}