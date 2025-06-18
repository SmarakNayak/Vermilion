import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const CodeBlockIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 4C3 3.44772 3.44772 3 4 3H7C7.55228 3 8 3.44772 8 4C8 4.55228 7.55228 5 7 5H4C3.44772 5 3 4.55228 3 4ZM6 8C6 7.44772 6.44772 7 7 7H20C20.5523 7 21 7.44772 21 8C21 8.55228 20.5523 9 20 9H7C6.44772 9 6 8.55228 6 8ZM6 12C6 11.4477 6.44772 11 7 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H7C6.44772 13 6 12.5523 6 12ZM6 16C6 15.4477 6.44772 15 7 15H15C15.5523 15 16 15.4477 16 16C16 16.5523 15.5523 17 15 17H7C6.44772 17 6 16.5523 6 16ZM3 20C3 19.4477 3.44772 19 4 19H7C7.55228 19 8 19.4477 8 20C8 20.5523 7.55228 21 7 21H4C3.44772 21 3 20.5523 3 20Z"
      fill={color}
    />
  </BaseIcon>
)

CodeBlockIcon.propTypes = IconProps
