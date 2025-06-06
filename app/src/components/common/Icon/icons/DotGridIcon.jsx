import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const DotGridIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path 
      fill-rule="evenodd" 
      clip-rule="evenodd" 
      d="M5 3C3.89543 3 3 3.89543 3 5C3 6.10457 3.89543 7 5 7C6.10457 7 7 6.10457 7 5C7 3.89543 6.10457 3 5 3Z"
      fill={color}
    />
    <path 
      fill-rule="evenodd" 
      clip-rule="evenodd" 
      d="M3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12Z"
      fill={color}
    />
    <path 
      fill-rule="evenodd" 
      clip-rule="evenodd" 
      d="M3 19C3 17.8954 3.89543 17 5 17C6.10457 17 7 17.8954 7 19C7 20.1046 6.10457 21 5 21C3.89543 21 3 20.1046 3 19Z"
      fill={color}
    />
    <path 
      fill-rule="evenodd" 
      clip-rule="evenodd" 
      d="M12 17C10.8954 17 10 17.8954 10 19C10 20.1046 10.8954 21 12 21C13.1046 21 14 20.1046 14 19C14 17.8954 13.1046 17 12 17Z"
      fill={color}
    />
    <path 
      fill-rule="evenodd" 
      clip-rule="evenodd" 
      d="M17 19C17 17.8954 17.8954 17 19 17C20.1046 17 21 17.8954 21 19C21 20.1046 20.1046 21 19 21C17.8954 21 17 20.1046 17 19Z"
      fill={color}
    />
    <path 
      fill-rule="evenodd" 
      clip-rule="evenodd" 
      d="M10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12Z"
      fill={color}
    />
    <path 
      fill-rule="evenodd" 
      clip-rule="evenodd" 
      d="M19 10C17.8954 10 17 10.8954 17 12C17 13.1046 17.8954 14 19 14C20.1046 14 21 13.1046 21 12C21 10.8954 20.1046 10 19 10Z"
      fill={color}
    />
    <path 
      fill-rule="evenodd" 
      clip-rule="evenodd" 
      d="M17 5C17 3.89543 17.8954 3 19 3C20.1046 3 21 3.89543 21 5C21 6.10457 20.1046 7 19 7C17.8954 7 17 6.10457 17 5Z"
      fill={color}
    />
    <path 
      fill-rule="evenodd" 
      clip-rule="evenodd" 
      d="M12 3C10.8954 3 10 3.89543 10 5C10 6.10457 10.8954 7 12 7C13.1046 7 14 6.10457 14 5C14 3.89543 13.1046 3 12 3Z"
      fill={color}
    />
  </BaseIcon>
)

DotGridIcon.propTypes = IconProps
