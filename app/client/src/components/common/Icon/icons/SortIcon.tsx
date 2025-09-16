import { BaseIcon } from '../BaseIcon'
import type { IconProps } from '../tsTypes'

export const SortIcon = ({ size, color, className }: IconProps) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 5C2 4.44772 2.44772 4 3 4L21 4C21.5523 4 22 4.44772 22 5C22 5.55228 21.5523 6 21 6L3 6C2.44772 6 2 5.55229 2 5Z"
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 12C5 11.4477 5.44772 11 6 11L18 11C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13L6 13C5.44771 13 5 12.5523 5 12Z"
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 19C8 18.4477 8.44772 18 9 18L15 18C15.5523 18 16 18.4477 16 19C16 19.5523 15.5523 20 15 20L9 20C8.44771 20 8 19.5523 8 19Z"
      fill={color}
    />
  </BaseIcon>
)