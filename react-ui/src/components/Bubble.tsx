import { Message } from "../models"
import * as Tooltip from '@radix-ui/react-tooltip';

export default function Bubble(props: {
  message: Message
}) {
  const { message } = props

  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={100}>
        <Tooltip.Trigger>
          {message.type === 'text' && (
            <div dangerouslySetInnerHTML={{ __html: message.content }} className="text-message"></div>
          )}
        </Tooltip.Trigger>
        <Tooltip.Content side="top" className="tw-bg-gray-800 tw-rounded tw-px-3 tw-py-1 tw-text-white tw-text-sm">
          {message.created_at.toLocaleString()}
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}