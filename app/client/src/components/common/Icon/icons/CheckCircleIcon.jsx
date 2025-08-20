import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const CheckCircleIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM16.7071 10.2071C17.0976 9.81658 17.0976 9.18342 16.7071 8.79289C16.3166 8.40237 15.6834 8.40237 15.2929 8.79289L10 14.0858L8.70711 12.7929C8.31658 12.4024 7.68342 12.4024 7.29289 12.7929C6.90237 13.1834 6.90237 13.8166 7.29289 14.2071L9.29289 16.2071C9.68342 16.5976 10.3166 16.5976 10.7071 16.2071L16.7071 10.2071Z" 
      fill={color}
    />
  </BaseIcon>
)

CheckCircleIcon.propTypes = IconProps
