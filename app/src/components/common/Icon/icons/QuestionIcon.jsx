import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const QuestionIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      d="M11 16C11 15.4477 11.4477 15 12 15C12.5523 15 13 15.4477 13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16Z" 
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM9 8C9 7.44772 9.44772 7 10 7H14C14.5523 7 15 7.44772 15 8V10C15 10.2652 14.8946 10.5196 14.7071 10.7071L13 12.4142V13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13V12C11 11.7348 11.1054 11.4804 11.2929 11.2929L13 9.58579V9H11C11 9.55228 10.5523 10 10 10C9.44772 10 9 9.55228 9 9V8Z" 
      fill={color}
    />
  </BaseIcon>
)

QuestionIcon.propTypes = IconProps
