import * as Popover from '@radix-ui/react-popover'
import Picker, { IEmojiData } from 'emoji-picker-react'
import { KeyboardEvent, MouseEvent, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import useDebounce from "../hooks/useDebounce"
import { Conversation, Message } from "../models"
import prixData from "../variables"
import { usePrixContext } from "./PrixProvider"
import ReplyToBar from "./ReplyToBar"
import TypingIndicator from "./TypingIndicator"
import { i18n } from '../utils';

export default function Composer({
  setShouldScroll
}: {
  setShouldScroll: (shouldScroll: boolean) => void
}) {
  const {
    replyTo,
    setReplyTo,
    messages,
    activeConversation,
    setActiveConversation,
  } = usePrixContext();

  const [content, setContent] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const { url } = useParams();
  const navigate = useNavigate();

  const debounced = useDebounce((value: string) => {
    setIsTyping(!!value);
  }, 1000)

  const handleKeyUp = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Auto-grow the textarea
    e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';

    // If the user hits enter, send the message
    if (e.key === 'Enter' && !e.shiftKey) {
      sendMessage();
      e.currentTarget.style.height = 'auto';
    }
  }

  const sendMessage = () => {
    if (content.length === 0) {
      return;
    }

    // Construct a new message content
    const message: Message = {
      type: 'text',
      content,
      created_at: new Date(),
      reactions: {},
    }

    if (activeConversation && activeConversation.id) {
      message.conversation_id = activeConversation.id;
    }

    if (replyTo) {
      message.reply_to = replyTo;
      message.reply_to_id = replyTo.id;
    }

    // Set parent id if it's the same sender and is the same day and it's 10 seconds after last message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.user_id === prixData.me.id && lastMessage.created_at.getTime() > new Date().getTime() - 10 * 1000) {
      message.parent_id = lastMessage.id;
    }

    // Add the message to the list
    // message.id = (lastMessage?.id || 0) + 1;
    // setMessages(messages.concat(message));

    fetch(prixData.apiUrl + 'messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': prixData.nonce,
      },
      credentials: "include",
      body: JSON.stringify({
        message,
        url,
      }),
    }).then(res => res.json())
      .then((data) => {
        // Instead of returning the message, return the conversation and update active conversation because
        // the message is already loaded by SSE
        if (!activeConversation.id) {
          setActiveConversation(data as Conversation);
          // window.location.reload();
          navigate(`/c/${data.conversation_id}`);
        }

        setShouldScroll(true);
      }).catch(err => console.log)

    // Reset message
    setContent('');

    // Reset replyTo
    setReplyTo(null);

    // Set typing to false
    setIsTyping(false);
    debounced('');
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    debounced(e.target.value);
  }

  // Append emoji to message
  const onEmojiClick = (event: MouseEvent, data: IEmojiData) => {
    setContent(content + data.emoji);
  }

  const sendTyping = (typing?: boolean) => {
    if (!activeConversation.id) {
      return;
    }

    fetch(`${prixData.apiUrl}conversations/${activeConversation.id}/typing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': prixData.nonce,
      },
      credentials: "include",
      body: JSON.stringify({
        typing: typing ?? isTyping
      }),
    }).then(res => res.json())
      .then((data) => {
      }).catch(err => console.log)
  }

  useEffect(() => {
    sendTyping();

    return () => {
      sendTyping(false);
    }
  }, [isTyping]);

  return (
    <div className="tw-py-5">
      <ReplyToBar />
      <TypingIndicator />
      <form className="tw-mt-5" onSubmit={(e) => {
        e.preventDefault();
        sendMessage();
      }}>
        <div className="tw-flex tw-gap-3 tw-px-2">
          <div className="tw-flex tw-bg-gray-100 tw-rounded tw-p-2 tw-w-full tw-outline-none">
            <textarea
              rows={1}
              onKeyUp={handleKeyUp}
              value={content}
              onChange={handleChange}
              placeholder="Aa"
              className="tw-flex-1 tw-px-2 tw-py-1 tw-bg-transparent tw-outline-none tw-resize-none tw-overflow-hidden"
            />
            <Popover.Root>
              <Popover.Trigger>
                <div className="tw-p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10Z"></path><path d="M16.5 14.5s-1.5 2-4.5 2s-4.5-2-4.5-2"></path><path fill="currentColor" d="M15.5 9a.5.5 0 1 1 0-1a.5.5 0 0 1 0 1Zm-7 0a.5.5 0 1 1 0-1a.5.5 0 0 1 0 1Z"></path></g></svg>
                </div>
              </Popover.Trigger>
              <Popover.Anchor />
              <Popover.Content side="top" className="tw-bg-white tw-shadow-lg tw-rounded-xl tw-border tw-border-gray-50">
                <Picker
                  native={true}
                  onEmojiClick={onEmojiClick}
                  pickerStyle={{
                    width: '350px',
                    border: 'none',
                    boxShadow: 'none'
                  }}
                />
              </Popover.Content>
            </Popover.Root>
          </div>

          <button
            title={i18n.__('Send', 'prix-chat')}
            className={`button button-primary ${content === '' ? 'disabled' : ''}`}
            disabled={content === ''}
          >
            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M27.71 4.29a1 1 0 0 0-1.05-.23l-22 8a1 1 0 0 0 0 1.87l8.59 3.43L19.59 11L21 12.41l-6.37 6.37l3.44 8.59A1 1 0 0 0 19 28a1 1 0 0 0 .92-.66l8-22a1 1 0 0 0-.21-1.05Z"></path></svg>
          </button>
        </div>
      </form>
    </div>
  )
}