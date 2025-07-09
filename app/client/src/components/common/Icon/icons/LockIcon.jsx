import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const LockIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      d="M13 13C13 12.4477 12.5523 12 12 12C11.4477 12 11 12.4477 11 13V17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17V13Z"
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7 6C7 3.23858 9.23858 1 12 1C14.7614 1 17 3.23858 17 6V8C18.6569 8 20 9.34315 20 11V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V11C4 9.34315 5.34315 8 7 8V6ZM15 6V8H9V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6ZM6 11C6 10.4477 6.44772 10 7 10H17C17.5523 10 18 10.4477 18 11V19C18 19.5523 17.5523 20 17 20H7C6.44772 20 6 19.5523 6 19V11Z"
      fill={color}
    />
  </BaseIcon>
)

LockIcon.propTypes = IconProps
