import { i18n } from "../utils"

export default function Welcome() {
  return (
    <div className="tw-flex tw-h-full tw-justify-center tw-items-center tw-bg-gray-50">
      <div>
        <div className="tw-rounded-xl tw-bg-green-100 tw-text-green-700 tw-px-3 tw-py-1 tw-font-semibold">
          {i18n.__('Select a chat to start messaging', 'prix-chat')}
        </div>
      </div>
    </div>
  )
}
