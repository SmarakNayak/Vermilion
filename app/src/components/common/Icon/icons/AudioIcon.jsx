import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const AudioIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      d="M13 4C13 3.44772 12.5523 3 12 3C11.4477 3 11 3.44772 11 4V20C11 20.5523 11.4477 21 12 21C12.5523 21 13 20.5523 13 20V4Z"
      fill={color}
    />
    <path
      d="M8 6C8.55228 6 9 6.44772 9 7V17C9 17.5523 8.55228 18 8 18C7.44772 18 7 17.5523 7 17V7C7 6.44772 7.44772 6 8 6Z"
      fill={color}
    />
    <path
      d="M4 9C4.55228 9 5 9.44772 5 10V14C5 14.5523 4.55228 15 4 15C3.44772 15 3 14.5523 3 14V10C3 9.44772 3.44772 9 4 9Z"
      fill={color}
    />
    <path
      d="M16 8C16.5523 8 17 8.44772 17 9V15C17 15.5523 16.5523 16 16 16C15.4477 16 15 15.5523 15 15V9C15 8.44772 15.4477 8 16 8Z"
      fill={color}
    />
    <path
      d="M21 6C21 5.44772 20.5523 5 20 5C19.4477 5 19 5.44772 19 6V18C19 18.5523 19.4477 19 20 19C20.5523 19 21 18.5523 21 18V6Z"
      fill={color}
    />
  </BaseIcon>
)

AudioIcon.propTypes = IconProps
