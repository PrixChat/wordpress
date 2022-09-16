import * as Dialog from '@radix-ui/react-dialog';
import { useState } from "react";
import { timeAgo } from "../../utils";
import prixData from "../../variables";
import Avatar from "../Primitives/Avatar";
import { usePrixContext } from "../PrixProvider";
import AddMembersDialog from "./AddMembersDialog";

export default function MembersDialog({
    open,
    setOpen,
}: {
    open: boolean,
    setOpen: (open: boolean) => void,
}) {
    const { activeConversation, setActiveConversation } = usePrixContext();
    const [view, setView] = useState<'members' | 'add-members'>('members');

    const removeUser = (id: number) => {
        fetch(`${prixData.apiUrl}peers/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': prixData.nonce,
            },
            credentials: "include",
        }).then(response => {
            const newConversation = { ...activeConversation };
            delete newConversation.peers[id];
            setActiveConversation(newConversation);
        })
            .catch(err => console.log);
    }

    const setOpenAddMembersDialog = (state: boolean) => {
        const view = state ? 'add-members' : 'members';
        setView(view);
    }

    return (
        <>
            <Dialog.Root open={open && view === 'members'}>
                <Dialog.Portal>
                    <Dialog.Overlay className="tw-fixed tw-inset-0 tw-bg-gray-700 tw-opacity-50" />
                    <Dialog.Content onEscapeKeyDown={() => { setOpen(false) }} className="tw-bg-white tw-rounded-lg tw-shadow-lg tw-fixed tw-top-1/3 tw-left-1/3 tw--translate-x-1/2 tw--translate-y-1/2 tw-w-1/5 tw-max-w-xl tw-max-h-96 tw-p-6">
                        <Dialog.Title className="tw-text-black tw-text-lg tw-leading-none tw-m-0">
                            Members
                        </Dialog.Title>

                        <div className="tw-my-5 pc-thin-scrollbar" style={{ maxHeight: 500 }}>
                            <ul>
                                {activeConversation.peers && Object.values(activeConversation.peers).map((peer) => (
                                    <li className="tw-flex tw-mt-3">

                                        <Avatar>
                                            <img width={50} height={50} src={peer.avatar} alt={peer.name} />
                                        </Avatar>

                                        <div className="tw-ml-4 tw-flex-1">
                                            <h4 className="tw-text-black tw-m-0">{peer.name}</h4>
                                            <div className="text-sm tw-text-gray-500">{timeAgo(peer.last_seen)}</div>
                                        </div>

                                        {activeConversation.user_id == prixData.me.id && (
                                            <div>
                                                <button onClick={() => removeUser(peer.id)} type="button" className="tw-cursor-pointer tw-text-red-600 hover:tw-text-red-500 tw-bg-transparent tw-border-none tw-font-semibold">
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="tw-flex tw-justify-between">
                            <button onClick={() => setView('add-members')} className="tw-border-none tw-bg-transparent tw-text-blue-500 tw-font-semibold">Add Members</button>
                            <button onClick={() => setOpen(false)} className="tw-border-none tw-bg-transparent tw-text-blue-500 tw-font-semibold">Close</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            <AddMembersDialog
                open={open && view === 'add-members'}
                setOpen={setOpenAddMembersDialog}
                conversation={activeConversation}
            />
        </>
    )
}
