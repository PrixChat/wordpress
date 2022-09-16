import { Peer } from "../models";
import * as Tooltip from '@radix-ui/react-tooltip';
import PrimitiveAvatar from './Primitives/Avatar';

export default function Avatar({
  size,
  peer
}: {
  size: number,
  peer?: Peer
}) {
  return (
    <div className="avatar">
      <Tooltip.Provider>
        <Tooltip.Root delayDuration={100}>
          <Tooltip.Trigger>
            <PrimitiveAvatar>
              <img width={size} height={size} src={peer?.avatar} alt={peer?.name} />
            </PrimitiveAvatar>
          </Tooltip.Trigger>
          <Tooltip.Content side="top" className="tw-bg-gray-800 tw-rounded tw-px-3 tw-py-1 tw-text-white tw-text-sm">
            {peer?.name}
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
}