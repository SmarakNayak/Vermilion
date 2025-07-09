import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const ArrowRotateIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.00005 3C5.55233 3 6.00005 3.44772 6.00005 4V5.29178C7.59161 3.8675 9.69475 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C8.22142 21 4.989 18.6717 3.65463 15.3752C3.4474 14.8633 3.69441 14.2803 4.20635 14.0731C4.71828 13.8658 5.30128 14.1129 5.5085 14.6248C6.54768 17.192 9.06392 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C10.093 5 8.36444 5.76172 7.101 7H9.00005C9.55233 7 10 7.44772 10 8C10 8.55228 9.55233 9 9.00005 9H5.00005C4.44776 9 4.00005 8.55228 4.00005 8V4C4.00005 3.44772 4.44776 3 5.00005 3Z" 
      fill={color}
    />
  </BaseIcon>
)

ArrowRotateIcon.propTypes = IconProps
