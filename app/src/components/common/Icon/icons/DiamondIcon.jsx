import { BaseIcon } from '../BaseIcon'
import { IconProps } from '../types'

export const DiamondIcon = ({ size, color, className }) => (
  <BaseIcon size={size} color={color} className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.16796 3.4453C6.35342 3.1671 6.66565 3 7.00001 3H17C17.3344 3 17.6466 3.1671 17.8321 3.4453L21.8321 9.4453C22.0856 9.82555 22.049 10.3293 21.7433 10.669L12.7433 20.669C12.5537 20.8797 12.2835 21 12 21C11.7165 21 11.4464 20.8797 11.2567 20.669L2.25671 10.669C1.95099 10.3293 1.91446 9.82555 2.16796 9.4453L6.16796 3.4453ZM7.53519 5L4.86853 9H19.1315L16.4648 5H7.53519ZM18.7546 11H5.24537L12 18.5052L18.7546 11Z"
      fill={color}
    />
  </BaseIcon>
)

DiamondIcon.propTypes = IconProps
