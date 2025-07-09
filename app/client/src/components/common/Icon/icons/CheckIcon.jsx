import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const CheckIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.7071 7.29289C20.0976 7.68342 20.0976 8.31658 19.7071 8.70711L9.70711 18.7071C9.31658 19.0976 8.68342 19.0976 8.29289 18.7071L4.29289 14.7071C3.90237 14.3166 3.90237 13.6834 4.29289 13.2929C4.68342 12.9024 5.31658 12.9024 5.70711 13.2929L9 16.5858L18.2929 7.29289C18.6834 6.90237 19.3166 6.90237 19.7071 7.29289Z" 
      fill={color}
    />
  </BaseIcon>
)

CheckIcon.propTypes = IconProps
