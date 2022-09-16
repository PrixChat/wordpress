import { usePrixContext } from "./PrixProvider";
import { i18n } from "../utils";

export default function ReplyToBar() {
    const { replyTo, setReplyTo, messages, setMessages} = usePrixContext();

    if (!replyTo) {
        return <div></div>;
    }

    return (
        <div className="replying-to">
            <div className="tw-flex tw-justify-around">
                <div className="tw-flex-1">
                    <p>{i18n.__('Replying to', 'prix-chat')} <span className="tw-font-bold">{replyTo.peer?.name}</span></p>
                    <p className="tw-text-gray-500 tw-italic">
                        {replyTo.content}
                    </p>
                </div>
                <div>
                    <button className="tw-text-gray-400 tw-text-lg hover:tw-text-gray-800" onClick={() => setReplyTo(null)}>&times;</button>
                </div>
            </div>
        </div>
    );
}