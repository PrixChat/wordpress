import { useEffect, useState } from "react";
import { Conversation } from "../models";
import { timeAgo } from "../utils";
import Avatar from "./Primitives/Avatar";

export default function ConversationAvatar({
    conversation,
}: {
    conversation: Conversation;
}) {

    return (
        <div className="conversation-avatar">
            <Avatar indicator={timeAgo(conversation?.recipient?.last_online ?? '')}>
                {Array.isArray(conversation.avatar) ? (
                    <div className="tw-relative" style={{ width: 50, height: 50 }}>
                        <img className="tw-absolute tw-top-0 tw-right-0" style={{ width: 33, height: 33 }} src={conversation.avatar[0]} alt="avatar" />
                        <img className="tw-absolute tw-bottom-0 tw-left-0 tw-shadow-sm" style={{ width: 33, height: 33 }} src={conversation.avatar[1]} alt="avatar" />
                    </div>
                ) : (
                    <img style={{ width: '50px', height: '50px' }} src={conversation.avatar} alt="avatar" />
                )}
            </Avatar>
        </div>
    )
}