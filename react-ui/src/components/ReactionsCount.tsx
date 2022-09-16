import { Message, Reaction } from "../models"
import * as Tooltip from '@radix-ui/react-tooltip';
import { Fragment } from "react";

export default function ReactionsCount(props: {
    reactions: { [key: string]: Reaction[] },
}) {
    const { reactions } = props;

    return (
        <div className="reactions tw-flex">
            <Tooltip.Provider>
                <div className="tw-flex tw-gap-1">
                    {Object.keys(reactions).map(reaction => (
                        <Fragment key={reaction}>
                            <Tooltip.Root delayDuration={100}>
                                <Tooltip.Trigger className="tw-relative tw-inset-0 tw-reaction tw-rounded-full tw-shadow-md">
                                    {reaction}
                                    {
                                        // Show count of reactions when there are more than 1
                                        reactions[reaction]?.length > 1 && (
                                            <div 
                                            className="tw-text-gray-500 tw-text-xs tw-absolute tw--right-1 tw-bottom-0 tw-font-bold tw-shadow-sm"
                                            >
                                                {reactions[reaction]?.length}
                                            </div>
                                        )
                                    }
                                </Tooltip.Trigger>
                                <Tooltip.Content side="top" className="tw-bg-gray-800 tw-rounded tw-px-3 tw-py-1 tw-text-white tw-text-sm">
                                    {reactions[reaction].map(r => r?.peer?.name).join(', ')}
                                    <Tooltip.Arrow />
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Fragment>
                    ))}
                </div>
            </Tooltip.Provider>
        </div>
    )
}