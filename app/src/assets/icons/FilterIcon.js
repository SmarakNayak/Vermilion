import React from 'react';

const FilterIcon = (props) => {

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
        d="M3 7C3 4.79086 4.79086 3 7 3C8.86384 3 10.4299 4.27477 10.874 6H20C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H10.874C10.4299 9.72523 8.86384 11 7 11C4.79086 11 3 9.20914 3 7ZM7 5C5.89543 5 5 5.89543 5 7C5 8.10457 5.89543 9 7 9C8.10457 9 9 8.10457 9 7C9 5.89543 8.10457 5 7 5Z" 
        fill={props.svgColor}
      />
      <path 
        fill-rule="evenodd" 
        clip-rule="evenodd" 
        d="M11.126 16H4C3.44772 16 3 16.4477 3 17C3 17.5523 3.44772 18 4 18H11.126C11.5701 19.7252 13.1362 21 15 21C16.8638 21 18.4299 19.7252 18.874 18H20C20.5523 18 21 17.5523 21 17C21 16.4477 20.5523 16 20 16H18.874C18.4299 14.2748 16.8638 13 15 13C13.1362 13 11.5701 14.2748 11.126 16ZM15 15C13.8954 15 13 15.8954 13 17C13 18.1046 13.8954 19 15 19C16.1046 19 17 18.1046 17 17C17 15.8954 16.1046 15 15 15Z" 
        fill={props.svgColor}
      />
    </svg>
  )
};

export default FilterIcon;