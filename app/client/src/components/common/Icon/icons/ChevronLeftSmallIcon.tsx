import { BaseIcon } from '../BaseIcon';
import { type IconProps } from '../tsTypes';

export const ChevronLeftSmallIcon = ({ size, color, className }: IconProps) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.7071 7.29289C15.0976 7.68342 15.0976 8.31658 14.7071 8.70711L11.4142 12L14.7071 15.2929C15.0976 15.6834 15.0976 16.3166 14.7071 16.7071C14.3166 17.0976 13.6834 17.0976 13.2929 16.7071L9.29289 12.7071C9.10536 12.5196 9 12.2652 9 12C9 11.7348 9.10536 11.4804 9.29289 11.2929L13.2929 7.29289C13.6834 6.90237 14.3166 6.90237 14.7071 7.29289Z"
      fill={color}
    />
  </BaseIcon>
);