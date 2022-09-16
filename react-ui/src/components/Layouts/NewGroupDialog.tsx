import * as Dialog from '@radix-ui/react-dialog';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Conversation, User } from "../../models";
import prixData from "../../variables";
import AddMembersDialog from "./AddMembersDialog";

export default function NewGroupDialog({
    open,
    setOpen,
}: {
    open: boolean,
    setOpen: (open: boolean) => void,
}) {
    const [users, setUsers] = useState<User[]>([]);
    const [addedUsers, setAddedUsers] = useState<User[]>([]);
    const [step, setStep] = useState(1);
    const [selectedAvatar, setSelectedAvatar] = useState<Blob | MediaSource>();
    const [preview, setPreview] = useState('');

    const [conversation, setConversation] = useState<Conversation>({
        type: 'group',
    } as Conversation);

    const navigate = useNavigate();

    useEffect(() => {
        setUsers(prixData.users.filter(user => user.id !== prixData.me.id));
    }, [])

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

    const next = (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData(e.target as HTMLFormElement);

        // Send request to create conversation
        fetch(prixData.apiUrl + 'conversations', {
            method: 'POST',
            headers: {
                'X-WP-Nonce': prixData.nonce,
            },
            credentials: "include",
            body: data,
        }).then(res => res.json())
            .then((data) => {
                setConversation(data as Conversation);
                setStep(2);
            }).catch(err => console.log)
    }

    const displayPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedAvatar(undefined)
            return
        }

        setSelectedAvatar(e.target.files[0])
    }

    const dialogTitle = step === 1 ? 'Create a new group' : 'Add members';

    return (
        <>
            <Dialog.Root open={open && step === 1}>
                <Dialog.Portal>
                    <Dialog.Overlay className="tw-fixed tw-inset-0 tw-bg-gray-700 tw-opacity-50" />
                    <Dialog.Content onEscapeKeyDown={() => { setOpen(false) }} className="tw-bg-white tw-rounded-lg tw-shadow-lg tw-fixed tw-top-1/3 tw-left-1/3 tw--translate-x-1/2 tw--translate-y-1/2 tw-w-1/4 tw-max-w-xl tw-max-h-96 tw-p-6">
                        <Dialog.Title className="tw-text-black tw-text-lg tw-leading-none tw-m-0">
                            {dialogTitle}
                        </Dialog.Title>

                        <form encType={'multipart/form-data'} onSubmit={next} className="tw-mt-5 tw-leading-normal">
                            <div className="tw-flex tw-gap-3">
                                <div className="tw-my-3">
                                    <label title="Set avatar">
                                        <input className="tw-hidden" type="file" name="avatar" onChange={displayPreview} accept="image/*" />

                                        {!selectedAvatar && (
                                            <div className="tw-text-white tw-text-5xl tw-p-5 tw-rounded-full tw-bg-blue-400">
                                                <svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M3 22q-.825 0-1.412-.587Q1 20.825 1 20V8q0-.825.588-1.412Q2.175 6 3 6h3.15L8 4h6v4h3v3h4v9q0 .825-.587 1.413Q19.825 22 19 22Zm8-3.5q1.875 0 3.188-1.312Q15.5 15.875 15.5 14q0-1.875-1.312-3.188Q12.875 9.5 11 9.5q-1.875 0-3.188 1.312Q6.5 12.125 6.5 14q0 1.875 1.312 3.188Q9.125 18.5 11 18.5Zm0-2q-1.05 0-1.775-.725Q8.5 15.05 8.5 14q0-1.05.725-1.775Q9.95 11.5 11 11.5q1.05 0 1.775.725q.725.725.725 1.775q0 1.05-.725 1.775q-.725.725-1.775.725ZM19 8V6h-2V4h2V2h2v2h2v2h-2v2Z"></path></svg>
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
                                        <input name="title" className="tw-w-full" type={'text'} required />
                                    </label>
                                </div>
                            </div>

                            <div className="tw-flex tw-gap-2 tw-justify-end">
                                <Dialog.Close className="tw-border-none tw-bg-gray-100 tw-rounded tw-px-4 tw-py-2" onClick={() => {
                                    setOpen(false);
                                }}>Cancel</Dialog.Close>
                                <button type="submit" className="tw-border-none tw-bg-blue-500 tw-rounded tw-px-4 tw-py-2 tw-text-white">Next</button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            <AddMembersDialog open={open && step === 2} conversation={conversation} setOpen={setOpen} />
        </>
    )
}
