import * as Popover from '@radix-ui/react-popover';
import { useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { Message } from "../models";
import prixData from "../variables";
import { usePrixContext } from "./PrixProvider";

const emojis = [
    '😀',
    '😂',
    '😊',
    '😉',
    '😍',
    '👍',
]

export default function MessageActions(props: {
    message: Message,
}) {
    const [visible, setVisible] = useState(false);

    const {
        replyTo,
        setReplyTo,
        messages,
        setMessages,
        selectedMessages,
        setSelectedMessages,
        dialogOpen,
        setDialogOpen,
    } = usePrixContext();

    const { message } = props;
    const [reactionPopoverOpen, setReactionPopoverOpen] = useState<boolean>(false);
    const ref = useRef(null)

    const reactionToMessage = (message: Message, reaction: string) => {
        if (typeof message.reactions[reaction] === 'undefined') {
            message.reactions[reaction] = [];
        }

        if (!message.reactions[reaction]?.some(r => r.peer_id === prixData.me.id)) {
            message.reactions[reaction]?.push({
                peer_id: prixData.me.id,
                reacted_at: new Date()
            })
        }

        let updated = messages.map(m => m.id === message.id ? message : m);

        setMessages(updated);

        fetch(`${prixData.apiUrl}messages/${message.id}/reactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': prixData.nonce,
            },
            credentials: "include",
            body: JSON.stringify({
                reaction,
            }),
        }).then(res => res.json())
            .then((data) => {
                console.log({ data })
            });
    }

    const hideAllActions = () => {
        setVisible(false);
        setReactionPopoverOpen(false);
    }

    useOnClickOutside(ref, hideAllActions);

    return (
        <div className={`group-hover:tw-visible ${visible ? 'tw-visible' : 'tw-invisible'}`} ref={ref}>
            <div className="tw-flex tw-items-center tw-align-bottom">
                <Popover.Root open={reactionPopoverOpen}>
                    <Popover.Trigger onClick={() => {
                        setReactionPopoverOpen(!reactionPopoverOpen);
                        setVisible(true);
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10Z"></path><path d="M16.5 14.5s-1.5 2-4.5 2s-4.5-2-4.5-2"></path><path fill="currentColor" d="M15.5 9a.5.5 0 1 1 0-1a.5.5 0 0 1 0 1Zm-7 0a.5.5 0 1 1 0-1a.5.5 0 0 1 0 1Z"></path></g></svg>
                    </Popover.Trigger>
                    <Popover.Anchor />
                    <Popover.Content side="top" className="tw-bg-white tw-shadow-lg tw-rounded-xl tw-px-4 tw-pt-2 tw-pb-3 tw-border tw-border-gray-50">
                        <div className="tw-flex">
                            {emojis.map(emoji => (
                                <button key={emoji} className="tw-text-gray-400 tw-text-3xl tw-drop-shadow-lg" onClick={() => {
                                    hideAllActions();
                                    reactionToMessage(message, emoji)
                                }}>{emoji}</button>
                            ))}
                        </div>
                    </Popover.Content>
                </Popover.Root>

                {/** Reply dialog */}
                <button className="tw-text-lg" onClick={() => {
                    setVisible(true);
                    setReplyTo({
                        id: message.id,
                        content: message.content,
                        peer: message.peer,
                    });
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="m10.25 4.75l-3.5 3.5l3.5 3.5"></path><path d="M6.75 8.25h6a4 4 0 0 1 4 4v7"></path></g></svg>
                </button>

                {message.user_id == prixData.me.id && (
                    <button onClick={() => {
                        setSelectedMessages([message]);
                        setDialogOpen(true)
                        setVisible(true);
                    }}><svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h8m-4 10c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10Z"></path></svg></button>
                )}
            </div>
        </div>
    )
}