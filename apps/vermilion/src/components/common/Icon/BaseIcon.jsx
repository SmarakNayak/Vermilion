import PropTypes from 'prop-types'
import { IconProps } from './types'

export const BaseIcon = ({ 
  size,
  color,
  className,
  children 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {children}
  </svg>
)

BaseIcon.propTypes = {
  ...IconProps,
  children: PropTypes.node.isRequired,
}
