import { BaseIcon } from '../BaseIcon'
import { type IconProps } from '../tsTypes'

export const DeleteIcon = ({ size, color, className }: IconProps) => (
  <BaseIcon size={size} color={color} className={className}>
    <path d="M10 2C9.44772 2 9 2.44772 9 3C9 3.55228 9.44772 4 10 4H14C14.5523 4 15 3.55228 15 3C15 2.44772 14.5523 2 14 2H10Z" fill={color}/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H5V19C5 20.6569 6.34315 22 8 22H16C17.6569 22 19 20.6569 19 19V7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H4ZM7 19V7H17V19C17 19.5523 16.5523 20 16 20H8C7.44772 20 7 19.5523 7 19Z" fill={color}/>
  </BaseIcon>
)