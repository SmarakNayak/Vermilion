import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const BurgerMenuIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H4Z" 
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 12C3 11.4477 3.44772 11 4 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H4C3.44772 13 3 12.5523 3 12Z" 
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 18C3 17.4477 3.44772 17 4 17H20C20.5523 17 21 17.4477 21 18C21 18.5523 20.5523 19 20 19H4C3.44772 19 3 18.5523 3 18Z" 
      fill={color}
    />
  </BaseIcon>
)

BurgerMenuIcon.propTypes = IconProps
