import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from "react";
import prixData from "../../variables";
import { usePrixContext } from "../PrixProvider";

export default function DeleteMessageDialog() {
    const {
        messages,
        setMessages,
        dialogOpen,
        setDialogOpen,
        selectedMessages,
        setSelectedMessages,
    } = usePrixContext();

    const [deleteForEveryOne, setDeleteForEveryOne] = useState(false);

    useEffect(() => {
        // console.log({ selectedMessages });
    }, [selectedMessages]);

    const deleteMessage = () => {
        const messageId = selectedMessages[0].id;

        fetch(`${prixData.apiUrl}messages/${messageId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': prixData.nonce,
            },
            credentials: "include",
            body: JSON.stringify({
                delete_for_every_one: deleteForEveryOne
            }),
        }).then(res => res.json())
            .then((data) => {
                let m = messages.map(message => {
                    if (message.id === messageId) {
                        message.deleted_at = new Date();
                    }
                    return message;
                });

                setMessages([...m]);
            }).catch(err => console.log)

        setSelectedMessages([]);
        setDialogOpen(false);
    }

    return (
        <Dialog.Root open={dialogOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="tw-fixed tw-inset-0 tw-bg-gray-700 tw-opacity-50" />
                <Dialog.Content onEscapeKeyDown={() => { setDialogOpen(false) }} className="tw-bg-white tw-rounded-lg tw-shadow-lg tw-fixed tw-top-1/3 tw-left-1/3 tw--translate-x-1/2 tw--translate-y-1/2 tw-w-1/4 tw-max-w-xl tw-max-h-96 tw-p-6">
                    <Dialog.Title className="tw-text-black tw-text-lg tw-leading-none tw-m-0">
                        Do you want to delete this message?
                    </Dialog.Title>
                    <div className="tw-my-5 tw-leading-normal">
                        <label>
                            <input
                                type="checkbox"
                                name="delete"
                                checked={deleteForEveryOne}
                                onClick={() => setDeleteForEveryOne(!deleteForEveryOne)}
                            />
                            Delete for everyone
                        </label>
                    </div>
                    <div className="tw-flex tw-gap-3">
                        <Dialog.Close className="tw-border-none tw-flex-1 tw-bg-gray-100 tw-rounded tw-py-2" onClick={() => {
                            setDialogOpen(false);
                        }}>Cancel</Dialog.Close>
                        <button className="tw-border-none tw-flex-1 tw-bg-blue-500 tw-rounded tw-py-2 tw-text-white"
                            onClick={() => {
                                deleteMessage();
                            }}>Remove</button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
