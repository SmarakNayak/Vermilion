import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const ChevronUpSmallIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.7071 13.7071C16.3166 14.0976 15.6834 14.0976 15.2929 13.7071L12 10.4142L8.70711 13.7071C8.31658 14.0976 7.68342 14.0976 7.29289 13.7071C6.90237 13.3166 6.90237 12.6834 7.29289 12.2929L11.2929 8.29289C11.6834 7.90237 12.3166 7.90237 12.7071 8.29289L16.7071 12.2929C17.0976 12.6834 17.0976 13.3166 16.7071 13.7071Z" 
      fill={color}
    />
  </BaseIcon>
)

ChevronUpSmallIcon.propTypes = IconProps
