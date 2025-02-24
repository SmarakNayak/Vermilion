import theme from "../../styles/theme";

export const Logo = ({ 
  size,
  color,
}) => (
  <svg height={size} viewBox="0 0 348 263" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path className="variable-color" d="M99.9616 45L73.9809 0C94.2594 5.21182 105.867 5.51401 125.942 0L99.9616 45Z" fill={color} />
    <path className="variable-color" d="M247.923 45L221.942 0C242.22 5.21182 253.828 5.51401 273.903 0L247.923 45Z" fill={color} />
    <path className="variable-color" d="M25.9812 154L0.000389099 109C20.279 114.212 31.8864 114.514 51.9619 109L25.9812 154Z" fill={color} />
    <path d="M173.942 154L147.961 109C168.24 114.212 179.847 114.514 199.923 109L173.942 154Z" fill={theme.colors.background.verm} />
    <path className="variable-color" d="M321.904 154L295.923 109C316.202 114.212 327.809 114.514 347.885 109L321.904 154Z" fill={color} />
    <path className="variable-color" d="M99.9616 263L73.9809 218C94.2594 223.212 105.867 223.514 125.942 218L99.9616 263Z" fill={color} />
    <path className="variable-color" d="M247.923 263L221.942 218C242.22 223.212 253.828 223.514 273.903 218L247.923 263Z" fill={color} />
  </svg>

)
