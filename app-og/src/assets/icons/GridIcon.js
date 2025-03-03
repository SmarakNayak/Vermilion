import React from 'react';

const GridIcon = (props) => {

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
        d="M4 3C3.44772 3 3 3.44772 3 4V10C3 10.5523 3.44772 11 4 11H10C10.5523 11 11 10.5523 11 10V4C11 3.44772 10.5523 3 10 3H4ZM5 9V5H9V9H5Z"
        fill={props.svgColor}
      />
      <path 
        fill-rule="evenodd" 
        clip-rule="evenodd" 
        d="M14 3C13.4477 3 13 3.44772 13 4V10C13 10.5523 13.4477 11 14 11H20C20.5523 11 21 10.5523 21 10V4C21 3.44772 20.5523 3 20 3H14ZM15 9V5H19V9H15Z"
        fill={props.svgColor}
      />
      <path 
        fill-rule="evenodd" 
        clip-rule="evenodd" 
        d="M13 14C13 13.4477 13.4477 13 14 13H20C20.5523 13 21 13.4477 21 14V20C21 20.5523 20.5523 21 20 21H14C13.4477 21 13 20.5523 13 20V14ZM15 15V19H19V15H15Z"
        fill={props.svgColor}
      />
      <path 
        fill-rule="evenodd" 
        clip-rule="evenodd" 
        d="M4 13C3.44772 13 3 13.4477 3 14V20C3 20.5523 3.44772 21 4 21H10C10.5523 21 11 20.5523 11 20V14C11 13.4477 10.5523 13 10 13H4ZM5 19V15H9V19H5Z"
        fill={props.svgColor}
      />
    </svg>
  )
};

export default GridIcon;