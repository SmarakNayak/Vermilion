import React from 'react';

const GalleryIcon = (props) => {

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
        d="M4 17C3.44772 17 3 16.5523 3 16L3 8C3 7.44771 3.44771 7 4 7C4.55228 7 5 7.44771 5 8L5 16C5 16.5523 4.55228 17 4 17ZM7 19C6.44772 19 6 18.5523 6 18L6 6C6 5.44771 6.44771 5 7 5C7.55228 5 8 5.44771 8 6L8 18C8 18.5523 7.55228 19 7 19ZM12 21C10.3431 21 9 19.6569 9 18L9 6C9 4.34315 10.3431 3 12 3L18 3C19.6569 3 21 4.34315 21 6L21 18C21 19.6569 19.6569 21 18 21L12 21Z"
        fill={props.svgColor}
      />
    </svg>
  )
};

export default GalleryIcon;