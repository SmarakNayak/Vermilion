import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const ArrowDownIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.25 3.25C12.8023 3.25 13.25 3.69772 13.25 4.25V17.3358L18.0429 12.5429C18.4334 12.1524 19.0666 12.1524 19.4571 12.5429C19.8476 12.9334 19.8476 13.5666 19.4571 13.9571L12.9571 20.4571C12.5666 20.8476 11.9334 20.8476 11.5429 20.4571L5.04289 13.9571C4.65237 13.5666 4.65237 12.9334 5.04289 12.5429C5.43342 12.1524 6.06658 12.1524 6.45711 12.5429L11.25 17.3358V4.25C11.25 3.69772 11.6977 3.25 12.25 3.25Z" 
      fill={color}
    />
  </BaseIcon>
)

ArrowDownIcon.propTypes = IconProps
