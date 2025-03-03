import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const WalletIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 6.5C2 4.84315 3.34315 3.5 5 3.5H19C20.6569 3.5 22 4.84315 22 6.5V17C22 18.6569 20.6569 20 19 20H5C3.34315 20 2 18.6569 2 17V6.5ZM5 5.5C4.44772 5.5 4 5.94772 4 6.5V7H20V6.5C20 5.94772 19.5523 5.5 19 5.5H5ZM20 9H4V10.5H9C9.55228 10.5 10 10.9477 10 11.5V11.6C10 12.6493 10.8507 13.5 11.9 13.5H12.1C13.1493 13.5 14 12.6493 14 11.6V11.5C14 10.9477 14.4477 10.5 15 10.5H20V9ZM20 12.5H15.8956C15.4893 14.22 13.9441 15.5 12.1 15.5H11.9C10.0559 15.5 8.51066 14.22 8.10436 12.5H4V17C4 17.5523 4.44772 18 5 18H19C19.5523 18 20 17.5523 20 17V12.5Z" 
      fill={color}
    />
  </BaseIcon>
)

WalletIcon.propTypes = IconProps
