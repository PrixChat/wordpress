import { Message } from "../models";
import prixData from "../variables";
import Avatar from "./Avatar";
import Bubble from "./Bubble";
import MessageActions from "./MessageActions";
import ReactionsCount from "./ReactionsCount";
import ReplyToIndicator from "./ReplyToIndicator";

export default function MessageTemplate({
    message
}: {
    message: Message;
}) {
    return (
        <div className={`tw-flex tw-w-full tw-gap-3  ${!message.parent_id ? 'tw-mt-2' : ''} ${message.user_id == prixData.me.id ? 'my-message' : ''}`} key={message.id}>
            <div style={{ width: 40 }}>
                <Avatar size={36} peer={message.peer} />
            </div>

            <div className="message-area tw-flex-1">
                <ReplyToIndicator message={message} />
                <div className="tw-group tw-flex">
                    <Bubble message={message} />
                    <MessageActions message={message} />
                </div>
                <ReactionsCount reactions={message.reactions} />
            </div>

            <div className="tw-flex">
                {message.seens && message.seens?.length > 0 && message.seens?.map(peer => (
                    <div key={peer.id} className="tw-inline-block tw-float-right tw-self-end">
                        <Avatar size={18} peer={peer} />
                    </div>
                ))}
            </div>
        </div>
    )
}