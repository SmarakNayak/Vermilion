import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const GridPlusIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 4C3 3.44772 3.44772 3 4 3H10C10.5523 3 11 3.44772 11 4V10C11 10.5523 10.5523 11 10 11H4C3.44772 11 3 10.5523 3 10V4ZM5 5V9H9V5H5ZM13 4C13 3.44772 13.4477 3 14 3H20C20.5523 3 21 3.44772 21 4V10C21 10.5523 20.5523 11 20 11H14C13.4477 11 13 10.5523 13 10V4ZM15 5V9H19V5H15ZM3 14C3 13.4477 3.44772 13 4 13H10C10.5523 13 11 13.4477 11 14V20C11 20.5523 10.5523 21 10 21H4C3.44772 21 3 20.5523 3 20V14ZM5 15V19H9V15H5ZM17 13C17.5523 13 18 13.4477 18 14V16H20C20.5523 16 21 16.4477 21 17C21 17.5523 20.5523 18 20 18H18V20C18 20.5523 17.5523 21 17 21C16.4477 21 16 20.5523 16 20V18H14C13.4477 18 13 17.5523 13 17C13 16.4477 13.4477 16 14 16H16V14C16 13.4477 16.4477 13 17 13Z" 
      fill={color}
    />
  </BaseIcon>
)

GridPlusIcon.propTypes = IconProps
