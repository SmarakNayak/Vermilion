import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const TermsIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      d="M8 14C8 13.4477 8.44772 13 9 13H15C15.5523 13 16 13.4477 16 14C16 14.5523 15.5523 15 15 15H9C8.44772 15 8 14.5523 8 14Z"
      fill={color}
    />
    <path
      d="M9 16C8.44772 16 8 16.4477 8 17C8 17.5523 8.44772 18 9 18H12C12.5523 18 13 17.5523 13 17C13 16.4477 12.5523 16 12 16H9Z"
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 5C4 3.34315 5.34315 2 7 2H11.771C12.5685 2 13.3333 2.31758 13.8962 2.88256L19.1252 8.13072C19.6854 8.69301 20 9.45441 20 10.2482V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V5ZM7 4C6.44772 4 6 4.44772 6 5V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V11H14C12.3431 11 11 9.65685 11 8V4H7ZM13 4.8167V8C13 8.55228 13.4477 9 14 9H17.168L13 4.8167Z"
      fill={color}
    />
  </BaseIcon>
)

TermsIcon.propTypes = IconProps
