import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const BookmarkIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 5C4 3.34315 5.34315 2 7 2H17C18.6569 2 20 3.34315 20 5V20C20 20.3828 19.7814 20.732 19.4371 20.8994C19.0928 21.0667 18.6832 21.0228 18.3822 20.7863L12.6178 16.2572C12.2552 15.9723 11.7448 15.9723 11.3822 16.2572L5.61782 20.7863C5.3168 21.0228 4.90717 21.0667 4.56286 20.8994C4.21855 20.732 4 20.3828 4 20V5ZM7 4C6.44772 4 6 4.44772 6 5V17.9425L10.1465 14.6845C11.2344 13.8298 12.7656 13.8298 13.8535 14.6845L18 17.9425V5C18 4.44772 17.5523 4 17 4H7Z" 
      fill={color}
    />
  </BaseIcon>
)

BookmarkIcon.propTypes = IconProps
