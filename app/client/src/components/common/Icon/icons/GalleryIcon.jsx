import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const GalleryIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 17C3.44772 17 3 16.5523 3 16L3 8C3 7.44771 3.44771 7 4 7C4.55228 7 5 7.44771 5 8L5 16C5 16.5523 4.55228 17 4 17ZM7 19C6.44772 19 6 18.5523 6 18L6 6C6 5.44771 6.44771 5 7 5C7.55228 5 8 5.44771 8 6L8 18C8 18.5523 7.55228 19 7 19ZM12 21C10.3431 21 9 19.6569 9 18L9 6C9 4.34315 10.3431 3 12 3L18 3C19.6569 3 21 4.34315 21 6L21 18C21 19.6569 19.6569 21 18 21L12 21ZM11 18C11 18.5523 11.4477 19 12 19L18 19C18.5523 19 19 18.5523 19 18L19 6C19 5.44771 18.5523 5 18 5L12 5C11.4477 5 11 5.44772 11 6L11 18Z" 
      fill={color}
    />
  </BaseIcon>
)

GalleryIcon.propTypes = IconProps
