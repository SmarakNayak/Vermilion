import { BaseIcon } from '../BaseIcon'
import type { IconProps } from '../tsTypes'

export const EditIcon = ({ size, color, className }: IconProps) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 19.9999C12 19.4477 12.4477 18.9999 13 18.9999H20C20.5523 18.9999 21 19.4477 21 19.9999C21 20.5522 20.5523 20.9999 20 20.9999H13C12.4477 20.9999 12 20.5522 12 19.9999Z" 
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.2071 6.62126C16.8166 6.23074 16.1834 6.23074 15.7929 6.62126L5 17.4142V18.9999H6.58579L17.3787 8.20705C17.7692 7.81653 17.7692 7.18336 17.3787 6.79283L17.2071 6.62126ZM14.3787 5.20705C15.5503 4.03548 17.4497 4.03548 18.6213 5.20705L18.7929 5.37862C19.9645 6.55019 19.9645 8.44969 18.7929 9.62126L7.70711 20.7071C7.51957 20.8946 7.26522 20.9999 7 20.9999H4C3.44772 20.9999 3 20.5522 3 19.9999V16.9999C3 16.7347 3.10536 16.4804 3.29289 16.2928L14.3787 5.20705Z" 
      fill={color}
    />
  </BaseIcon>
)

