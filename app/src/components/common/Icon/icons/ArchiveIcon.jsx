import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const ArchiveIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      d="M10 12C9.44772 12 9 12.4477 9 13C9 13.5523 9.44772 14 10 14H14C14.5523 14 15 13.5523 15 13C15 12.4477 14.5523 12 14 12H10Z" 
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 3C2.44772 3 2 3.44772 2 4V9C2 9.55228 2.44772 10 3 10V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V10C21.5523 10 22 9.55228 22 9V4C22 3.44772 21.5523 3 21 3H3ZM5 18V10H19V18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18ZM4 5V8H20V5H4Z" 
      fill={color}
    />
  </BaseIcon>
)

ArchiveIcon.propTypes = IconProps
