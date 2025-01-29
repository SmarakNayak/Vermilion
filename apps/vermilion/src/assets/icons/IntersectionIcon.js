import React from 'react';

const IntersectionIcon = (props) => {

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
        d="M3.29289 3.29289C3.48043 3.10536 3.73478 3 4 3L6 3C6.55228 3 7 3.44772 7 4C7 4.55229 6.55228 5 6 5H5L5 6C5 6.55229 4.55229 7 4 7C3.44772 7 3 6.55229 3 6L3 4C3 3.73478 3.10536 3.48043 3.29289 3.29289ZM11 4C11 3.44772 11.4477 3 12 3L14 3C14.5523 3 15 3.44772 15 4V6C15 6.55229 14.5523 7 14 7C13.4477 7 13 6.55229 13 6V5L12 5C11.4477 5 11 4.55229 11 4ZM9 10C9 9.44772 9.44772 9 10 9H14C14.5523 9 15 9.44772 15 10V14C15 14.5523 14.5523 15 14 15H10C9.44772 15 9 14.5523 9 14V10ZM11 11V13H13V11H11ZM17 10C17 9.44772 17.4477 9 18 9H20C20.5523 9 21 9.44772 21 10V12C21 12.5523 20.5523 13 20 13C19.4477 13 19 12.5523 19 12V11H18C17.4477 11 17 10.5523 17 10ZM4 11C4.55229 11 5 11.4477 5 12V13H6C6.55228 13 7 13.4477 7 14C7 14.5523 6.55228 15 6 15H4C3.73478 15 3.48043 14.8946 3.29289 14.7071C3.10536 14.5196 3 14.2652 3 14L3 12C3 11.4477 3.44772 11 4 11ZM10 17C10.5523 17 11 17.4477 11 18V19H12C12.5523 19 13 19.4477 13 20C13 20.5523 12.5523 21 12 21H10C9.44772 21 9 20.5523 9 20V18C9 17.4477 9.44772 17 10 17ZM20 17C20.5523 17 21 17.4477 21 18V20C21 20.5523 20.5523 21 20 21H18C17.4477 21 17 20.5523 17 20C17 19.4477 17.4477 19 18 19H19V18C19 17.4477 19.4477 17 20 17Z" 
        fill={props.svgColor}
      />
    </svg>
  )
};

export default IntersectionIcon;