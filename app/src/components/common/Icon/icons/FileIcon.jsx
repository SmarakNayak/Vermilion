import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const FileIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7 4C6.44772 4 6 4.44772 6 5V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V11H14C12.3431 11 11 9.65685 11 8V4H7ZM13 4.8167V8C13 8.55228 13.4477 9 14 9H17.168L13 4.8167ZM4 5C4 3.34315 5.34315 2 7 2H11.771C12.5685 2 13.3333 2.31758 13.8962 2.88256L19.1252 8.13072C19.6854 8.69301 20 9.45441 20 10.2482V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V5ZM13.0138 3.76171L13 3.77548Z"
      fill={color}
    />
    <path d="M10 18H12V20H10V18Z" fill={color} />
    <path d="M12 16H14V18H12V16Z" fill={color} />
    <path d="M10 14H12V16H10V14Z" fill={color} />
  </BaseIcon>
)

FileIcon.propTypes = IconProps
