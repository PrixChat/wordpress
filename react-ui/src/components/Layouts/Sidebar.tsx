import { FormEvent, useRef, useState } from "react";
import { DebounceInput } from 'react-debounce-input';
import Conversations from "../Conversations";
import useDebounce from "../../hooks/useDebounce"
import { i18n } from "../../utils";
import { useOnClickOutside } from "usehooks-ts";
import NewGroupDialog from "./NewGroupDialog";

export default function Sidebar() {
    const [search, setSearch] = useState('');
    const [searchText, setSearchText] = useState('');
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);

    const ref = useRef(null);
    useOnClickOutside(ref, () => setShowOffcanvas(false));

    const debounced = useDebounce((value: string) => {
        setSearch(value);
    }, 300)

    const toggleOffcanvas = () => {
        setShowOffcanvas(!showOffcanvas);
    }

    return (
        <aside>
            {showOffcanvas && (
                <div ref={ref} className="tw-absolute tw-inset-0 tw-z-10 tw-shadow-lg tw-w-full tw-flex">
                    <div className="tw-relative tw-max-w-sm tw-bg-white tw-shadow-lg" style={{ width: '300px' }}>
                        <div className="tw-absolute tw-right-2 tw-top-2">
                            <button
                                className="tw-border-0 tw-bg-transparent tw-cursor-pointer tw-text-lg"
                                onClick={() => setShowOffcanvas(false)}
                            >
                                <svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="m12 10.586l4.95-4.95l1.414 1.414l-4.95 4.95l4.95 4.95l-1.414 1.414l-4.95-4.95l-4.95 4.95l-1.414-1.414l4.95-4.95l-4.95-4.95L7.05 5.636z"></path></svg>
                            </button>
                        </div>

                        <ul className="tw-mt-5">
                            <li className="tw-my-3">
                                <button
                                    className="tw-px-4 tw-py-2 tw-cursor-pointer tw-font-semibold"
                                    onClick={() => {
                                        setShowNewGroupDialog(true);
                                        setShowOffcanvas(false);
                                    }}
                                >
                                    <span className="tw-text-lg tw-mr-2 tw-rounded tw-bg-blue-500 tw-text-white tw-pt-1 tw-px-1">
                                        <svg width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M24 14.6c0 .6-1.2 1-2.6 1.2c-.9-1.7-2.7-3-4.8-3.9c.2-.3.4-.5.6-.8h.8c3.1-.1 6 1.8 6 3.5zM6.8 11H6c-3.1 0-6 1.9-6 3.6c0 .6 1.2 1 2.6 1.2c.9-1.7 2.7-3 4.8-3.9l-.6-.9zm5.2 1c2.2 0 4-1.8 4-4s-1.8-4-4-4s-4 1.8-4 4s1.8 4 4 4zm0 1c-4.1 0-8 2.6-8 5c0 2 8 2 8 2s8 0 8-2c0-2.4-3.9-5-8-5zm5.7-3h.3c1.7 0 3-1.3 3-3s-1.3-3-3-3c-.5 0-.9.1-1.3.3c.8 1 1.3 2.3 1.3 3.7c0 .7-.1 1.4-.3 2zM6 10h.3C6.1 9.4 6 8.7 6 8c0-1.4.5-2.7 1.3-3.7C6.9 4.1 6.5 4 6 4C4.3 4 3 5.3 3 7s1.3 3 3 3z"></path></svg>
                                    </span>
                                    {i18n.__('New Group', 'prix-chat')}
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="tw-flex-1 tw-bg-gray-500 tw-opacity-50" onClick={() => setShowOffcanvas(false)}>

                    </div>
                </div>
            )}

            <NewGroupDialog open={showNewGroupDialog} setOpen={setShowNewGroupDialog} />

            <form className="tw-p-3 tw-flex">
                <button onClick={toggleOffcanvas} title="Show menu" type="button" className="tw-w-8 tw-h-8 tw-text-gray-400 tw-rounded-full tw-bg-transparent hover:tw-bg-gray-100 tw-border-transparent tw-flex tw-items-center tw-justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="1.5em" height="1.5em" viewBox="0 0 24 24"><path fill="currentColor" d="M3 18v-2h18v2Zm0-5v-2h18v2Zm0-5V6h18v2Z"></path></svg>
                </button>
                <input
                    value={searchText}
                    onChange={(e: FormEvent<HTMLInputElement>) => {
                        setSearchText(e.currentTarget.value);
                        debounced(e.currentTarget.value)
                    }
                    }
                    type="search"
                    placeholder={i18n.__('Search...', 'prix-chat')}
                    className="pc-search-input"
                />
            </form>
            <Conversations search={search} />
        </aside>
    )
}
