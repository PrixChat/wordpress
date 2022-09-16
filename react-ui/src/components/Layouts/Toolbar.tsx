import { timeAgo } from "../../utils";
import { usePrixContext } from "../PrixProvider";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import prixData from "../../variables";
import { useNavigate } from "react-router-dom";
import { i18n } from "../../utils";
import ConversationAvatar from "../ConversationAvatar";
import ManageGroupDialog from "./ManageGroupDialog";
import { useState } from "react";
import MembersDialog from "./MembersDialog";

export default function Toolbar() {
    const [showManageGroupDialog, setShowManageGroupDialog] = useState(false);
    const [showMembersDialog, setShowMembersDialog] = useState(false);

    const {
        activeConversation,
    } = usePrixContext();

    const navigate = useNavigate();

    const leaveConversation = () => {
        const { id } = activeConversation;

        // We don't need to mutate the messages array directly
        // because realtime already does that for us
        fetch(`${prixData.apiUrl}conversations/${activeConversation.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': prixData.nonce,
            },
            credentials: "include",
        }).then(response => {
            navigate("/");
        }).catch(err => console.log);
    }

    return (
        <div>
            <div className="chat-toolbar tw-gap-3">
                <div className="tw-flex-shrink">
                    <ConversationAvatar conversation={activeConversation} />
                </div>

                <div className="tw-flex-1">
                    <div className="tw-font-bold">{activeConversation.title}</div>
                    <div className="tw-font-sm tw-capitalize">{
                        timeAgo(activeConversation.recipient?.last_online ?? '') ?? activeConversation.recipient?.last_online
                    }</div>
                </div>

                <div className="tw-flex-shrink">
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger className="tw-text-gray-500 tw-text-lg">
                            <svg width="1em" height="1em" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><circle cx="8" cy="2.5" r=".75"></circle><circle cx="8" cy="8" r=".75"></circle><circle cx="8" cy="13.5" r=".75"></circle></g></svg>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                            <DropdownMenu.Content className="tw-bg-white tw-p-3 tw-shadow-sm">
                                {activeConversation.type === 'group' && (
                                    <DropdownMenu.Item className="">
                                        <button onClick={() => setShowManageGroupDialog(true)} className="tw-cursor-pointer tw-border-none tw-black tw-bg-transparent">
                                            <span className="tw-mr-2">
                                                <svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M24 14.6c0 .6-1.2 1-2.6 1.2c-.9-1.7-2.7-3-4.8-3.9c.2-.3.4-.5.6-.8h.8c3.1-.1 6 1.8 6 3.5zM6.8 11H6c-3.1 0-6 1.9-6 3.6c0 .6 1.2 1 2.6 1.2c.9-1.7 2.7-3 4.8-3.9l-.6-.9zm5.2 1c2.2 0 4-1.8 4-4s-1.8-4-4-4s-4 1.8-4 4s1.8 4 4 4zm0 1c-4.1 0-8 2.6-8 5c0 2 8 2 8 2s8 0 8-2c0-2.4-3.9-5-8-5zm5.7-3h.3c1.7 0 3-1.3 3-3s-1.3-3-3-3c-.5 0-.9.1-1.3.3c.8 1 1.3 2.3 1.3 3.7c0 .7-.1 1.4-.3 2zM6 10h.3C6.1 9.4 6 8.7 6 8c0-1.4.5-2.7 1.3-3.7C6.9 4.1 6.5 4 6 4C4.3 4 3 5.3 3 7s1.3 3 3 3z"></path></svg>
                                            </span>
                                            {i18n.__('Manage Group', 'prix-chat')}
                                        </button>
                                    </DropdownMenu.Item>
                                )}

                                <DropdownMenu.Item className="tw-mt-3">
                                    <button onClick={leaveConversation} className="tw-cursor-pointer tw-border-none tw-text-red-600 tw-bg-transparent">
                                        <span className="tw-mr-2">
                                            <svg width="1em" height="1em" viewBox="0 0 512 512"><rect width="448" height="80" x="32" y="48" fill="currentColor" rx="32" ry="32"></rect><path fill="currentColor" d="M74.45 160a8 8 0 0 0-8 8.83l26.31 252.56a1.5 1.5 0 0 0 0 .22A48 48 0 0 0 140.45 464h231.09a48 48 0 0 0 47.67-42.39v-.21l26.27-252.57a8 8 0 0 0-8-8.83Zm248.86 180.69a16 16 0 1 1-22.63 22.62L256 318.63l-44.69 44.68a16 16 0 0 1-22.63-22.62L233.37 296l-44.69-44.69a16 16 0 0 1 22.63-22.62L256 273.37l44.68-44.68a16 16 0 0 1 22.63 22.62L278.62 296Z"></path></svg>
                                        </span>
                                        {i18n.__('Leave Conversation', 'prix-chat')}
                                    </button>
                                </DropdownMenu.Item>
                                <DropdownMenu.Arrow />
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            </div>

            <ManageGroupDialog
                open={showManageGroupDialog}
                setOpen={setShowManageGroupDialog}
                showMembersDiaLog={showMembersDialog}
                setShowMembersDialog={setShowMembersDialog}
            />

            <MembersDialog open={showMembersDialog} setOpen={setShowMembersDialog} />
        </div>
    )
}
