import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const AvatarCircleIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10ZM12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8Z" 
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 4C7.58172 4 4 7.58172 4 12C4 14.2568 4.93452 16.2954 6.43769 17.7499C7.71606 16.0793 9.73137 15 12 15C14.2686 15 16.2839 16.0793 17.5623 17.7499C19.0655 16.2954 20 14.2568 20 12C20 7.58172 16.4183 4 12 4ZM15.9632 18.9509C15.0481 17.7633 13.6126 17 12 17C10.3874 17 8.95184 17.7633 8.03678 18.9509C9.20513 19.6185 10.558 20 12 20C13.442 20 14.7949 19.6185 15.9632 18.9509Z" 
      fill={color}
    />
  </BaseIcon>
)

AvatarCircleIcon.propTypes = IconProps
