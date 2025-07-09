import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const MailIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 4C3.34315 4 2 5.34315 2 7V17C2 18.6569 3.34315 20 5 20H19C20.6569 20 22 18.6569 22 17V7C22 5.34315 20.6569 4 19 4H5ZM4 7C4 6.44772 4.44772 6 5 6H19C19.5523 6 20 6.44772 20 7V7.35007L12.406 10.7252C12.1475 10.8401 11.8523 10.8401 11.5937 10.7252L4 7.35017V7ZM4 9.53881V17C4 17.5523 4.44772 18 5 18H19C19.5523 18 20 17.5523 20 17V9.53871L13.2183 12.5528C12.4426 12.8975 11.5572 12.8975 10.7815 12.5528L4 9.53881Z" 
      fill={color}
    />
  </BaseIcon>
)

MailIcon.propTypes = IconProps
