import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const LoginIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.5 12C3.5 12.5523 3.94772 13 4.5 13L13.5858 13L10.2929 16.2929C9.90237 16.6834 9.90237 17.3166 10.2929 17.7071C10.6834 18.0976 11.3166 18.0976 11.7071 17.7071L16.7071 12.7071C16.8946 12.5196 17 12.2652 17 12C17 11.7348 16.8946 11.4804 16.7071 11.2929L11.7071 6.29289C11.3166 5.90237 10.6834 5.90237 10.2929 6.29289C9.90237 6.68342 9.90237 7.31658 10.2929 7.70711L13.5858 11L4.5 11C3.94772 11 3.5 11.4477 3.5 12ZM13 4C13 4.55228 13.4477 5 14 5H18C18.5523 5 19 5.44772 19 6V18C19 18.5523 18.5523 19 18 19H14C13.4477 19 13 19.4477 13 20C13 20.5523 13.4477 21 14 21H18C19.6569 21 21 19.6569 21 18V6C21 4.34315 19.6569 3 18 3H14C13.4477 3 13 3.44772 13 4Z" 
      fill={color}
    />
  </BaseIcon>
)

LoginIcon.propTypes = IconProps
