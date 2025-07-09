import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const ImageIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15 6C13.3431 6 12 7.34315 12 9C12 10.6569 13.3431 12 15 12C16.6569 12 18 10.6569 18 9C18 7.34315 16.6569 6 15 6ZM14 9C14 8.44772 14.4477 8 15 8C15.5523 8 16 8.44772 16 9C16 9.55228 15.5523 10 15 10C14.4477 10 14 9.55228 14 9Z" 
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 3C4.34315 3 3 4.34315 3 6V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V6C21 4.34315 19.6569 3 18 3H6ZM5 6C5 5.44772 5.44772 5 6 5H18C18.5523 5 19 5.44772 19 6V18C19 18.5523 18.5523 19 18 19H17.4142L11.1213 12.7071C9.94975 11.5355 8.05026 11.5355 6.87868 12.7071L5 14.5858V6ZM9.70711 14.1213L14.5858 19H6C5.44772 19 5 18.5523 5 18V17.4142L8.29289 14.1213C8.68342 13.7308 9.31658 13.7308 9.70711 14.1213Z" 
      fill={color}
    />
  </BaseIcon>
)

ImageIcon.propTypes = IconProps
