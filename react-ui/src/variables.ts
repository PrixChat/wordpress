import { Conversation, Peer, User } from "./models"

type PrixProps = {
    me: Peer,
    conversations: Conversation[],
    apiUrl: string,
    nonce: string,
    language: string,
    users: User[],
    availableEmojis: string[],
}

let prixData: PrixProps = (window as any).prix as PrixProps;

export default prixData;