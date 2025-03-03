import React from 'react';

const AttachmentIcon = (props) => {

  return (
    <svg 
      width={props.svgSize}
      height={props.svgSize}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M14 4C12.3431 4 11 5.34315 11 7V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V8C13 7.44772 13.4477 7 14 7C14.5523 7 15 7.44772 15 8V15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15V7C9 4.23858 11.2386 2 14 2C16.7614 2 19 4.23858 19 7V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V8C5 7.44772 5.44772 7 6 7C6.55228 7 7 7.44772 7 8V15C7 17.7614 9.23858 20 12 20C14.7614 20 17 17.7614 17 15V7C17 5.34315 15.6569 4 14 4Z" 
        fill={props.svgColor}
      />
    </svg>
  )
};

export default AttachmentIcon;