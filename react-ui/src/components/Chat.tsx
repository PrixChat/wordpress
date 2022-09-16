import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Conversation, Message, Peer, ReplyTo } from "../models";
import { mergeById } from "../utils";
import { useExtendedState } from "../hooks/useExtendedState";
import prixData from "../variables";
import Composer from "./Composer";
import Toolbar from "./Layouts/Toolbar";
import MessageTemplate from "./MessageTemplate";
import { usePrixContext } from "./PrixProvider";

type SSEResponse = {
    messages?: Message[],
    peers?: {
        [id: string]: Peer
    },
    conversations?: Conversation[],
}

export default function Chat() {
    // const [messages, setMessages] = useState<Message[]>([]);
    const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);

    const {
        messages,
        setMessages,
        activeConversation,
        setActiveConversation,
        conversations,
        setConversations,
    } = usePrixContext();

    const { url } = useParams();
    let sseUrl = '';
    const loadingRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [before, setBefore] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [hash, setHash] = useState('');
    const [firstLoad, setFirstLoad] = useState(true);
    const [loadEnded, setLoadEnded] = useState(false);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    let observer = useRef<IntersectionObserver | null>(null);
    const [shouldScroll, setShouldScroll, getScroll] = useExtendedState(true);

    if (!url) {
        return <div>Select a chat to continue</div>;
    }

    // Do not re-render when conversations change, it's expensive
    useEffect(() => {
        let eventSource: any = null;

        setMessages([]);

        const fetchMessages = async () => {
            // Get active conversation data
            const response = await fetch(`${prixData.apiUrl}conversations/${url}?_wpnonce=${prixData.nonce}`);
            const data = await response.json();
            const conversation = data as Conversation;

            if (conversation.id) {
                setActiveConversation(conversation);
            } else {
                prixData.conversations.forEach((c) => {
                    if (c.url === url) {
                        setActiveConversation(c);
                    }
                })
            }

            setHash(conversation.hash);

            if (!conversation.id) {
                return;
            }

            sseUrl = `${prixData.apiUrl}sse?_wpnonce=${prixData.nonce}&conversation_id=${conversation.id}`;
            eventSource = new EventSource(sseUrl);

            eventSource.onopen = () => {
                console.log("Connected to SSE");
            }

            eventSource.onmessage = (e: MessageEvent) => {
                if (!e.data || e.data === 'ping') {
                    return;
                }

                // Parse the message
                const sseResponse = JSON.parse(e.data) as SSEResponse;

                if (sseResponse.messages && sseResponse.messages.length) {
                    let responseMessages = sseResponse.messages;
                    setBefore(sseResponse.messages[0].id ?? 0);

                    // For reactivity, we need to update the messages array,
                    // we should use callback functions instead of setState directly
                    // in order to get updated state as soon as it updated!
                    setMessages(messages => {
                        // Merge the new messages with the existing ones by id
                        const newMessages = mergeById(messages, responseMessages);
                        return [...newMessages];
                    });
                    setLoading(false);
                }

                // This data returned every 3 seconds
                if (sseResponse.conversations && sseResponse.conversations.length) {
                    setConversations([...sseResponse.conversations]);
                }

                if (sseResponse.peers) {
                    conversation.peers = sseResponse.peers;
                    setActiveConversation({ ...conversation });
                }

                // @todo: Fix set time out and get current position ref instead
                getScroll().then((shouldScroll) => {
                    if (shouldScroll) {
                        setTimeout(() => {
                            scrollToBottom();
                        }, 300)
                    }
                })
            }

            eventSource.onerror = () => {
                eventSource.close()
            }
        }

        fetchMessages();

        return () => {
            setMessages([]);
            eventSource?.close();
        }
    }, [url]);

    useEffect(() => {
        const handleObserver = (entries: IntersectionObserverEntry[]) => {
            if (entries[0].isIntersecting && before && !loading) {
                let params = {
                    conversation_id: activeConversation.id + '',
                    before: before + '',
                    _wpnonce: prixData.nonce,
                }

                setLoading(true);

                fetch(`${prixData.apiUrl}messages?${new URLSearchParams(params)}`).then(res => res.json()).then(data => {
                    if (data.length > 0) {
                        setMessages((messages) => {
                            return [...data, ...messages]
                        });
                        setBefore(data[0].id ?? 0);
                    } else {
                        setLoadEnded(true);
                    }
                    setLoading(false);
                }).catch(error => console.log);
            }
        };

        observer.current = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: "40px",
            threshold: .5,
        });

        if (loadingRef.current && !loadEnded) {
            observer.current?.observe(loadingRef.current);
        }

        if (loadEnded) {
            observer.current?.disconnect();
        }

        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        }
    }, [url, before]);

    const scrollToBottom = () => {
        scrollRef.current?.scrollTo({
            left: 0,
            top: scrollRef.current?.scrollHeight ?? 0,
        });
    }

    // We scroll the bottom of the chat on the first load
    // do not scroll on subsequent loads because when the user are scrolling up to read old messages,
    // they need to keep their position
    useEffect(() => {
        if (firstLoad && messages.length > 0) {
            scrollToBottom();
            setFirstLoad(false);
        }

        const scrollObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setShouldScroll(true);
            } else {
                setShouldScroll(false);
            }
        }, {
            root: scrollRef.current,
            threshold: 1,
        });

        if (messagesEndRef.current) {
            scrollObserver.observe(messagesEndRef.current);
        }

        return () => {
            scrollObserver.disconnect();
            setShouldScroll(true);
        }
    }, [messages])

    return (
        <div className="tw-flex tw-flex-col tw-h-full tw-relative">
            <Toolbar />
            <div ref={scrollRef} className="tw-bg-gray-50 tw-p-2 tw-overflow-y-scroll tw-flex-1">
                {!loadEnded && messages.length > 0 && <div className="loading-bar" ref={loadingRef}>Loading...</div>}
                {loadEnded && <div className="tw-text-xs tw-text-gray-400 tw-px-4 tw-text-center"><em>No more messages</em></div>}

                <div style={{ minHeight: '1000px' }} className="tw-flex tw-flex-col tw-justify-end">
                    <div>
                        {messages?.map((message, index) => (
                            !message.deleted_at && <MessageTemplate message={message} key={message.id} />
                        ))}
                    </div>
                </div>

                <div style={{
                    width: '100%',
                    height: '20px',
                }} ref={messagesEndRef}></div>
            </div>
            <Composer setShouldScroll={setShouldScroll} />
        </div>
    )
}