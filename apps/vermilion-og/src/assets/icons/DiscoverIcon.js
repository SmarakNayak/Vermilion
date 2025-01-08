import React from 'react';

const DiscoverIcon = (props) => {

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
        d="M7 4C7 3.44772 7.44772 3 8 3H16C16.5523 3 17 3.44772 17 4C17 4.55228 16.5523 5 16 5H8C7.44772 5 7 4.55228 7 4ZM5 7C5 6.44772 5.44772 6 6 6H18C18.5523 6 19 6.44772 19 7C19 7.55228 18.5523 8 18 8H6C5.44772 8 5 7.55228 5 7ZM3 12C3 10.3431 4.34315 9 6 9H18C19.6569 9 21 10.3431 21 12V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V12ZM6 11C5.44772 11 5 11.4477 5 12V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V12C19 11.4477 18.5523 11 18 11H6Z" 
        fill={props.svgColor}
      />
    </svg>
  )
};

export default DiscoverIcon;