import { Message, ReplyTo } from "../models";

export default function ReplyToIndicator(props: {
    message: Message
}) {
    const { message } = props;

    if (!message.reply_to) {
        return (null);
    }

    return (
        <div className="tw-mt-3">
            <p className="tw-text-gray-400 tw-text-xs tw-rounded-lg">
                {message.peer?.name} replied to {message.reply_to?.peer?.name}
            </p>
            <div className="reply-to tw-bg-gray-100 tw-text-gray-400 tw-px-4 tw-py-1 tw--mb-3 tw-mt-2 tw-text-sm tw-rounded-lg">
                {message?.reply_to.content}
            </div>
        </div>
    );
}