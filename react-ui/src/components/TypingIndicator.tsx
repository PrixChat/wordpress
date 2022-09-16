import { useEffect, useState } from "react";
import { Peer } from "../models"
import prixData from "../variables";
import { usePrixContext } from "./PrixProvider";

export default function TypingIndicator() {
    const { activeConversation } = usePrixContext();
    const [peers, setPeers] = useState<Peer[]>([]);

    useEffect(() => {
        if (activeConversation.peers) {
            const p = Object.values(activeConversation.peers).filter(peer => peer.is_typing == true && peer.user_id != prixData.me.id);
            setPeers([...p]);
        }
    }, [activeConversation])

    return (
        <div>
            {peers && peers.map(peer =>
                <div key={peer.id}>
                    {peer.is_typing && <span>{peer.name} is typing...</span>}
                </div>
            )}
        </div>
    )
}
