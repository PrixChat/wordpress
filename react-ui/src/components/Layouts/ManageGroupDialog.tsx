import * as Dialog from '@radix-ui/react-dialog';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Conversation, User } from "../../models";
import prixData from "../../variables";
import Avatar from "../Primitives/Avatar";
import { usePrixContext } from "../PrixProvider";

export default function ManageGroupDialog({
    open,
    setOpen,
    showMembersDiaLog,
    setShowMembersDialog,
}: {
    open: boolean,
    setOpen: (open: boolean) => void,
    showMembersDiaLog: boolean,
    setShowMembersDialog: (open: boolean) => void,
}) {
    const { activeConversation, setActiveConversation } = usePrixContext();

    const [selectedAvatar, setSelectedAvatar] = useState<Blob | MediaSource>();
    const [preview, setPreview] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!selectedAvatar) {
            setPreview('');
            return;
        }

        const objectURL = URL.createObjectURL(selectedAvatar);
        setPreview(objectURL);

        return () => {
            URL.revokeObjectURL(objectURL);
        }
    }, [selectedAvatar])

    const save = (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData(e.target as HTMLFormElement);
        let id = activeConversation.id ?? 0;
        data.set('id', id.toString());

        // Send request to create conversation
        fetch(`${prixData.apiUrl}conversations/${activeConversation.id}`, {
            method: 'POST',
            headers: {
                'X-WP-Nonce': prixData.nonce,
            },
            credentials: "include",
            body: data,
        }).then(res => res.json())
            .then((data) => {
                setActiveConversation(data as Conversation);
                setOpen(false);
                window.location.reload();
            }).catch(err => console.log)
    }

    const displayPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedAvatar(undefined)
            return
        }

        setSelectedAvatar(e.target.files[0])
    }

    return (
        <Dialog.Root open={open}>
            <Dialog.Portal>
                <Dialog.Overlay className="tw-fixed tw-inset-0 tw-bg-gray-700 tw-opacity-50" />
                <Dialog.Content onEscapeKeyDown={() => { setOpen(false) }} className="tw-bg-white tw-rounded-lg tw-shadow-lg tw-fixed tw-top-1/3 tw-left-1/3 tw--translate-x-1/2 tw--translate-y-1/2 tw-w-1/5 tw-max-w-xl tw-max-h-96 tw-p-6">
                    <Dialog.Title className="tw-text-black tw-text-lg tw-leading-none tw-m-0">
                        Edit Group
                    </Dialog.Title>
                    <form encType={'multipart/form-data'} onSubmit={save} className="tw-mt-5 tw-leading-normal">
                        <div className="tw-flex tw-gap-3">
                            <div className="tw-my-3">
                                <label title="Set avatar">
                                    <input className="tw-hidden" type="file" name="avatar" onChange={displayPreview} accept="image/*" />

                                    {!activeConversation.has_avatar && !selectedAvatar && (
                                        <div className="tw-text-white tw-text-5xl tw-p-5 tw-rounded-full tw-bg-blue-400">
                                            <svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M3 22q-.825 0-1.412-.587Q1 20.825 1 20V8q0-.825.588-1.412Q2.175 6 3 6h3.15L8 4h6v4h3v3h4v9q0 .825-.587 1.413Q19.825 22 19 22Zm8-3.5q1.875 0 3.188-1.312Q15.5 15.875 15.5 14q0-1.875-1.312-3.188Q12.875 9.5 11 9.5q-1.875 0-3.188 1.312Q6.5 12.125 6.5 14q0 1.875 1.312 3.188Q9.125 18.5 11 18.5Zm0-2q-1.05 0-1.775-.725Q8.5 15.05 8.5 14q0-1.05.725-1.775Q9.95 11.5 11 11.5q1.05 0 1.775.725q.725.725.725 1.775q0 1.05-.725 1.775q-.725.725-1.775.725ZM19 8V6h-2V4h2V2h2v2h2v2h-2v2Z"></path></svg>
                                        </div>
                                    )}

                                    {activeConversation.has_avatar && !selectedAvatar && (
                                        <div className="tw-relative hover:tw-bg-gray-500/40 tw-rounded-full tw-group">
                                            <img
                                                className="tw-rounded-full tw-object-fill"
                                                width={96}
                                                height={96}
                                                src={activeConversation.avatar?.toString()} alt="avatar"
                                            />
                                            <div className="tw-absolute tw-inset-0 tw-invisible group-hover:tw-visible tw-flex tw-items-center tw-justify-center tw-text-5xl tw-text-white">
                                                <svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M3 22q-.825 0-1.412-.587Q1 20.825 1 20V8q0-.825.588-1.412Q2.175 6 3 6h3.15L8 4h6v4h3v3h4v9q0 .825-.587 1.413Q19.825 22 19 22Zm8-3.5q1.875 0 3.188-1.312Q15.5 15.875 15.5 14q0-1.875-1.312-3.188Q12.875 9.5 11 9.5q-1.875 0-3.188 1.312Q6.5 12.125 6.5 14q0 1.875 1.312 3.188Q9.125 18.5 11 18.5Zm0-2q-1.05 0-1.775-.725Q8.5 15.05 8.5 14q0-1.05.725-1.775Q9.95 11.5 11 11.5q1.05 0 1.775.725q.725.725.725 1.775q0 1.05-.725 1.775q-.725.725-1.775.725ZM19 8V6h-2V4h2V2h2v2h2v2h-2v2Z"></path></svg>
                                            </div>
                                        </div>
                                    )}

                                    {selectedAvatar && (
                                        <div className="tw-relative hover:tw-bg-gray-500/40 tw-rounded-full tw-group">
                                            <img
                                                className="tw-rounded-full tw-object-fill"
                                                width={96}
                                                height={96}
                                                src={preview}
                                                alt="avatar"
                                            />
                                            <div className="tw-absolute tw-inset-0 tw-invisible group-hover:tw-visible tw-flex tw-items-center tw-justify-center tw-text-5xl tw-text-white">
                                                <svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M3 22q-.825 0-1.412-.587Q1 20.825 1 20V8q0-.825.588-1.412Q2.175 6 3 6h3.15L8 4h6v4h3v3h4v9q0 .825-.587 1.413Q19.825 22 19 22Zm8-3.5q1.875 0 3.188-1.312Q15.5 15.875 15.5 14q0-1.875-1.312-3.188Q12.875 9.5 11 9.5q-1.875 0-3.188 1.312Q6.5 12.125 6.5 14q0 1.875 1.312 3.188Q9.125 18.5 11 18.5Zm0-2q-1.05 0-1.775-.725Q8.5 15.05 8.5 14q0-1.05.725-1.775Q9.95 11.5 11 11.5q1.05 0 1.775.725q.725.725.725 1.775q0 1.05-.725 1.775q-.725.725-1.775.725ZM19 8V6h-2V4h2V2h2v2h2v2h-2v2Z"></path></svg>
                                            </div>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div className="tw-my-3 tw-flex-1">
                                <label>
                                    <span className="tw-block tw-text-gray-700 tw-text-sm tw-mb-2">Group name</span>
                                    <input defaultValue={activeConversation.title} name="title" className="tw-w-full" type={'text'} required />
                                </label>
                            </div>
                        </div>

                        <div className="tw-mt-5">
                            <ul>
                                <li className="tw-cursor-pointer tw-p-3 hover:tw-bg-gray-100" onClick={() => setShowMembersDialog(true)}>
                                    <div className="tw-flex tw-gap-3">
                                        <div className="tw-rounded tw-bg-blue-500 tw-text-lg tw-px-1 tw-py-1 tw-leading-none tw-text-white">
                                            <svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M24 14.6c0 .6-1.2 1-2.6 1.2c-.9-1.7-2.7-3-4.8-3.9c.2-.3.4-.5.6-.8h.8c3.1-.1 6 1.8 6 3.5zM6.8 11H6c-3.1 0-6 1.9-6 3.6c0 .6 1.2 1 2.6 1.2c.9-1.7 2.7-3 4.8-3.9l-.6-.9zm5.2 1c2.2 0 4-1.8 4-4s-1.8-4-4-4s-4 1.8-4 4s1.8 4 4 4zm0 1c-4.1 0-8 2.6-8 5c0 2 8 2 8 2s8 0 8-2c0-2.4-3.9-5-8-5zm5.7-3h.3c1.7 0 3-1.3 3-3s-1.3-3-3-3c-.5 0-.9.1-1.3.3c.8 1 1.3 2.3 1.3 3.7c0 .7-.1 1.4-.3 2zM6 10h.3C6.1 9.4 6 8.7 6 8c0-1.4.5-2.7 1.3-3.7C6.9 4.1 6.5 4 6 4C4.3 4 3 5.3 3 7s1.3 3 3 3z"></path></svg>
                                        </div>
                                        <div className="tw-flex-1">
                                            Members
                                        </div>
                                        <div className="tw-flex-1 tw-text-right tw-text-black">
                                            {activeConversation.peers && Object.keys(activeConversation.peers).length && (
                                                <span className="tw-text-gray-500 tw-text-sm">{Object.keys(activeConversation.peers).length}</span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="tw-flex tw-gap-2 tw-justify-end">
                            <Dialog.Close className="tw-border-none tw-bg-gray-100 tw-rounded tw-px-4 tw-py-2" onClick={() => {
                                setOpen(false);
                            }}>Close</Dialog.Close>
                            <button type="submit" className="tw-border-none tw-bg-blue-500 tw-rounded tw-px-4 tw-py-2 tw-text-white">Save</button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
