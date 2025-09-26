import { BaseIcon } from '../BaseIcon'
import type { IconProps } from '../tsTypes'

export const DotsHorizontalIcon = ({ size, color, className }: IconProps) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      d="M2 12C2 10.8954 2.89543 10 4 10C5.10457 10 6 10.8954 6 12C6 13.1046 5.10457 14 4 14C2.89543 14 2 13.1046 2 12Z"
      fill={color}
    />
    <path
      d="M10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12Z"
      fill={color}
    />
    <path
      d="M20 10C18.8954 10 18 10.8954 18 12C18 13.1046 18.8954 14 20 14C21.1046 14 22 13.1046 22 12C22 10.8954 21.1046 10 20 10Z"
      fill={color}
    />
  </BaseIcon>
)
