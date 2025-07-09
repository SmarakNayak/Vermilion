import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const ErrorCircleIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" 
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 7C12.5523 7 13 7.44772 13 8V12.5C13 13.0523 12.5523 13.5 12 13.5C11.4477 13.5 11 13.0523 11 12.5V8C11 7.44772 11.4477 7 12 7Z" 
      fill={color}
    />
    <path
      d="M13.25 15.75C13.25 16.4403 12.6903 17 12 17C11.3096 17 10.75 16.4403 10.75 15.75C10.75 15.0596 11.3096 14.5 12 14.5C12.6903 14.5 13.25 15.0596 13.25 15.75Z" 
      fill={color}
    />
  </BaseIcon>
)

ErrorCircleIcon.propTypes = IconProps
