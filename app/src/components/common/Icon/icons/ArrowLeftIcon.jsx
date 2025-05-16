import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const ArrowLeftIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.7071 4.79289C11.3166 4.40237 10.6834 4.40237 10.2929 4.79289L3.79289 11.2929C3.40237 11.6834 3.40237 12.3166 3.79289 12.7071L10.2929 19.2071C10.6834 19.5976 11.3166 19.5976 11.7071 19.2071C12.0976 18.8166 12.0976 18.1834 11.7071 17.7929L6.91421 13H20C20.5523 13 21 12.5523 21 12C21 11.4477 20.5523 11 20 11H6.91421L11.7071 6.20711C12.0976 5.81658 12.0976 5.18342 11.7071 4.79289Z" 
      fill={color}
    />
  </BaseIcon>
)

ArrowLeftIcon.propTypes = IconProps
