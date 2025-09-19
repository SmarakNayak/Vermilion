import { BaseIcon } from '../BaseIcon';
import { type IconProps } from '../tsTypes';

export const ChevronDownSmallIcon = ({ size, color, className }: IconProps) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.7071 10.2929C16.3166 9.90237 15.6834 9.90237 15.2929 10.2929L12 13.5858L8.70711 10.2929C8.31658 9.90237 7.68342 9.90237 7.29289 10.2929C6.90237 10.6834 6.90237 11.3166 7.29289 11.7071L11.2929 15.7071C11.6834 16.0976 12.3166 16.0976 12.7071 15.7071L16.7071 11.7071C17.0976 11.3166 17.0976 10.6834 16.7071 10.2929Z"
      fill={color}
    />
  </BaseIcon>
);
