import React from 'react';

const ArrowCornerDownLeftIcon = (props) => {

  return (
    <svg 
      width={props.svgSize}
      height={props.svgSize}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        fill-rule="evenodd" 
        clip-rule="evenodd" 
        d="M3.29289 15.7071C2.90237 15.3166 2.90237 14.6834 3.29289 14.2929L7.29289 10.2929C7.68342 9.90237 8.31658 9.90237 8.70711 10.2929C9.09763 10.6834 9.09763 11.3166 8.70711 11.7071L6.41421 14L18 14C18.5523 14 19 13.5523 19 13L19 5C19 4.44771 19.4477 4 20 4C20.5523 4 21 4.44771 21 5L21 13C21 14.6569 19.6569 16 18 16L6.41421 16L8.70711 18.2929C9.09763 18.6834 9.09763 19.3166 8.70711 19.7071C8.31658 20.0976 7.68342 20.0976 7.29289 19.7071L3.29289 15.7071Z" 
        fill={props.svgColor}
      />
    </svg>
  )
};

export default ArrowCornerDownLeftIcon;