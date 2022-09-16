import * as Dialog from '@radix-ui/react-dialog';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Conversation, User } from "../../models";
import prixData from "../../variables";
import Avatar from "../Primitives/Avatar";
import { usePrixContext } from "../PrixProvider";

export default function AddMembersDialog({
    open,
    setOpen,
    conversation,
}: {
    open: boolean,
    setOpen: (open: boolean) => void,
    conversation: Conversation
}) {
    const { conversations, setConversations } = usePrixContext();

    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [addedUsers, setAddedUsers] = useState<User[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        let alreadyAddedPeers: any[] = [];

        if (conversation.peers) {
            alreadyAddedPeers = Object.values(conversation?.peers).filter(peer => {
                return prixData.users.find(user => user.id == peer.user_id) !== undefined;
            }).map(peer => {
                return (peer.user_id ?? 0) * 1;
            });
        }

        const allUsers = prixData.users.filter(user => {
            if (user.id === prixData.me.id) {
                return false;
            }

            if (alreadyAddedPeers.includes(user.id)) {
                return false;
            }

            return true;
        });

        setAvailableUsers(allUsers);
        setUsers(allUsers);
    }, [conversation.id])

    const autoCompleteUsers = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value.length) {
            let u = availableUsers.filter(user => user.name.toLowerCase().includes(value.toLowerCase()));
            setUsers([...u]);
        } else {
            setUsers(availableUsers);
        }
    }

    const addMembers = (e: React.FormEvent) => {
        e.preventDefault()

        fetch(`${prixData.apiUrl}peers/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': prixData.nonce,
            },
            credentials: "include",
            body: JSON.stringify({
                conversation_id: conversation.id,
                users: addedUsers
            }),
        }).then(res => res.json())
            .then((data) => {
                setOpen(false);
                setConversations([...conversations, data]);
                navigate(`/c/${conversation.id}`);
            }).catch(err => console.log)
    }

    const addUser = (user: User) => {
        setAddedUsers([...addedUsers, user]);
        setUsers(users.filter(u => u.id != user.id));
    }

    const removeAddedUser = (user: User) => {
        setAddedUsers(addedUsers.filter(u => u.id !== user.id));
        setUsers([...users, user]);
    }

    return (
        <Dialog.Root open={open}>
            <Dialog.Portal>
                <Dialog.Overlay className="tw-fixed tw-inset-0 tw-bg-gray-700 tw-opacity-50" />
                <Dialog.Content onEscapeKeyDown={() => { setOpen(false) }} className="tw-bg-white tw-rounded-lg tw-shadow-lg tw-fixed tw-top-1/3 tw-left-1/3 tw--translate-x-1/2 tw--translate-y-1/2 tw-w-1/4 tw-max-w-xl tw-max-h-96 tw-p-6">
                    <Dialog.Title className="tw-text-black tw-text-lg tw-leading-none tw-m-0">
                        Add Members
                    </Dialog.Title>

                    {conversation.id && (
                        <form method="post" onSubmit={addMembers}>
                            <div className="tw-flex tw-gap-3">
                                <div className="tw-w-1/2">
                                    <div className="tw-my-3">
                                        <input autoComplete="off" onChange={autoCompleteUsers} type={'search'} name="search" className="tw-w-full" placeholder={'Search...'} />
                                    </div>

                                    <ul>
                                        {users.map(user => (
                                            <li className="tw-cursor-pointer" onClick={() => addUser(user)} key={user.id}>
                                                <div className="tw-flex tw-gap-5">
                                                    <Avatar>
                                                        <img className="tw-rounded-full" width={20} height={20} src={user.avatar} alt={user.name} />
                                                    </Avatar>
                                                    <div>
                                                        {user.name}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="tw-flex-1">
                                    <h4>Adding ({addedUsers.length}) Users</h4>
                                    <ul>
                                        {addedUsers.map(user => (
                                            <li key={user.id}>
                                                <div className="tw-flex tw-gap-3">
                                                    <Avatar>
                                                        <img className="tw-rounded-full" width={20} height={20} src={user.avatar} alt={user.name} />
                                                    </Avatar>
                                                    <div className="tw-flex-1">
                                                        {user.name}
                                                    </div>

                                                    <button onClick={() => removeAddedUser(user)} className="tw-bg-transparent tw-border-none tw-cursor-pointer " title="Remove user">
                                                        <svg width="1em" height="1em" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5"></path></svg>
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="tw-flex tw-gap-2 tw-justify-end">
                                <Dialog.Close className="tw-border-none tw-bg-gray-100 tw-rounded tw-px-4 tw-py-2" onClick={() => {
                                    setOpen(false);
                                }}>Cancel</Dialog.Close>
                                <button type="submit" className="tw-border-none tw-bg-blue-500 tw-rounded tw-px-4 tw-py-2 tw-text-white">Submit</button>
                            </div>
                        </form>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
