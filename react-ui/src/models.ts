export type User = {
    id: number,
    name: string,
    email: string,
    avatar: string,
}

export type Meta = {
    [key: string]: any
}

export type Peer = {
    id: number,
    user_id?: number,
    name: string,
    email?: string,
    phone?: string,
    avatar?: string,
    meta?: Meta,
    conversation_id?: number,
    conversation?: Conversation,
    last_seen?: Date,
    status?: string,
    role?: string,
    created_at?: Date,
    updated_at?: Date,
    is_typing?: boolean,
    last_online?: Date,
}

export type Reaction = {
    peer_id: number,
    peer?: Peer,
    reacted_at: Date,
}

export type Message = {
    id?: number,
    type?: "text" | "image" | "video" | "audio" | "file",
    content?: any,
    history?: any,
    conversation_id?: number,
    conversation?: Conversation,
    peer_id?: number,
    user_id?: number,
    peer?: Peer,
    created_at: Date,
    updated_at?: Date,
    parent_id?: number,
    parent?: Message,
    children?: Message[],
    seens?: Peer[], // Cached
    reactions: {
        [reaction: string]: Reaction[],
    },
    reply_to_id?: number,
    reply_to?: ReplyTo,
    deleted_at?: Date,
    deleted_for?: "me" | "all",
    is_hiding?: boolean,
}

export type Conversation = {
    id?: number,
    url?: string,
    peers: {
        [peer_id: number]: Peer,
    },
    messages: Message[],
    meta: Meta,
    title?: string,
    description?: string,
    last_message?: Message
    avatar?: string | string[],
    has_avatar?: boolean,
    status: string,
    created_at: Date,
    updated_at: Date,
    type: string,
    hash: string,
    recipient: Peer,
    unread_count: number,
    user_id?: number,
}

export type ReplyTo = {
    id?: number,
    content?: string,
    peer_id?: number,
    peer?: Peer,
}
