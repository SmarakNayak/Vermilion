import { BaseIcon } from '../BaseIcon'
import { type IconProps } from '../tsTypes'

export const FolderIcon = ({ size, color, className }: IconProps) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      d="M3 7C3 5.89543 3.89543 5 5 5H8.17157C8.70201 5 9.21071 5.21071 9.58579 5.58579L10.4142 6.41421C10.7893 6.78929 11.298 7 11.8284 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V7Z"
      fill={color}
    />
    <path
      d="M3 7C3 5.89543 3.89543 5 5 5H8.17157C8.70201 5 9.21071 5.21071 9.58579 5.58579L9 6H19C20.1046 6 21 6.89543 21 8V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V7Z"
      fill={color}
      opacity="0.7"
    />
  </BaseIcon>
)