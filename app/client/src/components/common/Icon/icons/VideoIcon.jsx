import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const VideoIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      d="M15 12.866C15.3094 12.6873 15.5 12.3572 15.5 11.9999C15.5 11.6427 15.3094 11.3125 15 11.1339L10.5 8.53583C10.1906 8.3572 9.8094 8.3572 9.5 8.53583C9.1906 8.71446 9 9.04459 9 9.40185L9 14.598C9 14.9553 9.1906 15.2854 9.5 15.464C9.8094 15.6427 10.1906 15.6427 10.5 15.464L15 12.866Z"
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 7C2 5.34315 3.34315 4 5 4H19C20.6569 4 22 5.34315 22 7V17C22 18.6569 20.6569 20 19 20H5C3.34315 20 2 18.6569 2 17V7ZM5 6C4.44772 6 4 6.44772 4 7V17C4 17.5523 4.44772 18 5 18H19C19.5523 18 20 17.5523 20 17V7C20 6.44772 19.5523 6 19 6H5Z" 
      fill={color}
    />
  </BaseIcon>
)

VideoIcon.propTypes = IconProps
