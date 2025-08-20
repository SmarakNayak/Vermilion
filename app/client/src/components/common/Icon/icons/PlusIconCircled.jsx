import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const PlusIconCircled = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" />
    <path d="M12 8v8M8 12h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </BaseIcon>
)

PlusIconCircled.propTypes = IconProps