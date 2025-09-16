import { BaseIcon } from '../BaseIcon'
import type { IconProps } from '../tsTypes'

export const InfoCircleIcon = ({ size, color, className }: IconProps) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 10.5C12.5523 10.5 13 10.9477 13 11.5V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V11.5C11 10.9477 11.4477 10.5 12 10.5Z"
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.5 7.99999C13.5 8.82842 12.8284 9.49999 12 9.49999C11.1715 9.49999 10.5 8.82842 10.5 7.99999C10.5 7.17157 11.1715 6.49999 12 6.49999C12.8284 6.49999 13.5 7.17157 13.5 7.99999Z"
      fill={color}
    />
  </BaseIcon>
)