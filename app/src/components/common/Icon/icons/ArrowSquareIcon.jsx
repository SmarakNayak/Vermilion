import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const ArrowSquareIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14 4C14 3.44772 14.4477 3 15 3H20C20.5523 3 21 3.44772 21 4V9C21 9.55228 20.5523 10 20 10C19.4477 10 19 9.55228 19 9V6.41421L12.7071 12.7071C12.3166 13.0976 11.6834 13.0976 11.2929 12.7071C10.9024 12.3166 10.9024 11.6834 11.2929 11.2929L17.5858 5H15C14.4477 5 14 4.55228 14 4Z" 
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 7C5.44772 7 5 7.44772 5 8V18C5 18.5523 5.44772 19 6 19H16C16.5523 19 17 18.5523 17 18L17 13C17 12.4477 17.4477 12 18 12C18.5523 12 19 12.4477 19 13L19 18C19 19.6569 17.6569 21 16 21H6C4.34315 21 3 19.6569 3 18V8C3 6.34315 4.34315 5 6 5H11C11.5523 5 12 5.44772 12 6C12 6.55228 11.5523 7 11 7H6Z" 
      fill={color}
    />
  </BaseIcon>
)

ArrowSquareIcon.propTypes = IconProps
