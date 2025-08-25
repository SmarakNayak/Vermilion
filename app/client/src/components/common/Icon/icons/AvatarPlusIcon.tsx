import { BaseIcon } from '../BaseIcon'
import { type IconProps } from '../tsTypes'

export const AvatarPlusIcon = ({ size, color, className }: IconProps) => (
  <BaseIcon size={size} color={color} className={className}>
    {/* Avatar body/shoulders */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M 4.938 19.084 C 6.523 15.998 9.7314 15 12 15 C 14.2686 15 17.451 16.019 19.058 19.063 M 19.068 19.063 C 18.878 19.369 17.5228 22 12 22 C 6.4771 22 5.043 19.242 4.938 19.084
         M15.9632 18.9509C15.0481 17.7633 13.6126 17 12 17C10.3874 17 8.95184 17.7633 8.03678 18.9509C9.20513 19.6185 10.558 20 12 20C13.442 20 14.7949 19.6185 15.9632 18.9509Z"
      fill={color}
    />
    {/* Avatar head/face only */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10ZM12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8Z" 
      fill={color}
    />
    {/* Plus sign overlay */}
    <path
      d="M15.5 13h5M18 10.5v5" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </BaseIcon>
)

//useful links:
//https://svg-path-visualizer.netlify.app/
//https://yqnn.github.io/svg-path-editor/