import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const ArrowUpIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.5429 3.54289C11.9334 3.15237 12.5666 3.15237 12.9571 3.54289L19.4571 10.0429C19.8476 10.4334 19.8476 11.0666 19.4571 11.4571C19.0666 11.8476 18.4334 11.8476 18.0429 11.4571L13.25 6.66421V19.75C13.25 20.3023 12.8023 20.75 12.25 20.75C11.6977 20.75 11.25 20.3023 11.25 19.75V6.66421L6.45711 11.4571C6.06658 11.8476 5.43342 11.8476 5.04289 11.4571C4.65237 11.0666 4.65237 10.4334 5.04289 10.0429L11.5429 3.54289Z" 
      fill={color}
    />
  </BaseIcon>
)

ArrowUpIcon.propTypes = IconProps
