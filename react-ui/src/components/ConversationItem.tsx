import { NavLink } from "react-router-dom";
import { Conversation } from "../models";
import { timeAgo } from "../utils";
import ConversationAvatar from "./ConversationAvatar";
import { usePrixContext } from "./PrixProvider";

export default function ConversationItem({
    conversation
}: {
    conversation: Conversation
}) {
    const { activeConversation, setActiveConversation, totalUnread, setTotalUnread } = usePrixContext();

    return (
        <NavLink
            key={conversation.url}
            to={{
                pathname: `/c/${conversation.url}`
            }}
            onClick={() => {
                setTotalUnread((total) => {
                    return total - conversation.unread_count;
                });
                conversation.unread_count = 0;
                setActiveConversation({ ...conversation });
            }}
        >
            <div className="conversation-item tw-flex tw-px-4 tw-py-2 hover:tw-bg-gray-200 tw-gap-2 tw-text-sm tw-relative tw-group">
                <ConversationAvatar conversation={conversation} />

                <div className="conversation-item__info tw-flex-1">
                    <div className="conversation-item__name tw-font-semibold">
                        {conversation.type === 'group' && (
                            <span className="tw-mr-1">
                                <svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M24 14.6c0 .6-1.2 1-2.6 1.2c-.9-1.7-2.7-3-4.8-3.9c.2-.3.4-.5.6-.8h.8c3.1-.1 6 1.8 6 3.5zM6.8 11H6c-3.1 0-6 1.9-6 3.6c0 .6 1.2 1 2.6 1.2c.9-1.7 2.7-3 4.8-3.9l-.6-.9zm5.2 1c2.2 0 4-1.8 4-4s-1.8-4-4-4s-4 1.8-4 4s1.8 4 4 4zm0 1c-4.1 0-8 2.6-8 5c0 2 8 2 8 2s8 0 8-2c0-2.4-3.9-5-8-5zm5.7-3h.3c1.7 0 3-1.3 3-3s-1.3-3-3-3c-.5 0-.9.1-1.3.3c.8 1 1.3 2.3 1.3 3.7c0 .7-.1 1.4-.3 2zM6 10h.3C6.1 9.4 6 8.7 6 8c0-1.4.5-2.7 1.3-3.7C6.9 4.1 6.5 4 6 4C4.3 4 3 5.3 3 7s1.3 3 3 3z"></path></svg>
                            </span>
                        )}
                        <span>{conversation.title} </span>
                    </div>

                    <div className={`conversation-item__message ${conversation.unread_count > 0 ? 'has-unread' : ''}`}>
                        {conversation.messages.length > 0 && (
                            <span>
                                {conversation?.messages[0].peer?.name}: <em dangerouslySetInnerHTML={{ __html: conversation?.messages[0]?.content }}></em> &middot;
                                <small>{timeAgo(conversation.messages[0]?.created_at)}</small>
                            </span>
                        )}
                    </div>
                </div>

                {conversation.unread_count > 0 && (
                    <div className="tw-absolute tw-text-white tw-text-xs tw-top-4 tw-right-4 tw-rounded-full tw-bg-red-500 tw-px-2 tw-flex tw-flex-column tw-justify-center tw-items-center">
                        {conversation.unread_count}
                    </div>
                )}
            </div>
        </NavLink>
    )
}
