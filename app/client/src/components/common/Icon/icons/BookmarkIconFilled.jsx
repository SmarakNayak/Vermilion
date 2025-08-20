import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const BookmarkIconFilled = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      d="M7 2C5.34315 2 4 3.34315 4 5V20C4 20.3828 4.21855 20.732 4.56286 20.8994C4.90717 21.0667 5.3168 21.0228 5.61782 20.7863L11.3822 16.2572C11.7448 15.9723 12.2552 15.9723 12.6178 16.2572L18.3822 20.7863C18.6832 21.0228 19.0928 21.0667 19.4371 20.8994C19.7814 20.732 20 20.3828 20 20V5C20 3.34315 18.6569 2 17 2H7Z" 
      fill={color}
    />
  </BaseIcon>
)

BookmarkIconFilled.propTypes = IconProps