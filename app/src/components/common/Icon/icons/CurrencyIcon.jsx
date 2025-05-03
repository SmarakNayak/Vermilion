import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const CurrencyIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 5C12.5523 5 13 5.44772 13 6V7H15C15.5523 7 16 7.44772 16 8C16 8.55228 15.5523 9 15 9H11C10.4477 9 10 9.44772 10 10C10 10.5523 10.4477 11 11 11H13C14.6569 11 16 12.3431 16 14C16 15.6569 14.6569 17 13 17V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V17H9C8.44772 17 8 16.5523 8 16C8 15.4477 8.44772 15 9 15H13C13.5523 15 14 14.5523 14 14C14 13.4477 13.5523 13 13 13H11C9.34315 13 8 11.6569 8 10C8 8.34315 9.34315 7 11 7V6C11 5.44772 11.4477 5 12 5Z" 
      fill={color}
    />
  </BaseIcon>
)

CurrencyIcon.propTypes = IconProps
