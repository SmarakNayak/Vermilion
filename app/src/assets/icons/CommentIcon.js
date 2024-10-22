import React from 'react';

const CommentIcon = (props) => {

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
        d="M5 5C4.44772 5 4 5.44772 4 6V18.4669L5.72831 17.4285C6.19492 17.1481 6.72902 17 7.27338 17H19C19.553 17 20 16.5527 20 16.0011V5.99648C20 5.44649 19.5546 5 19 5H5ZM2 6C2 4.34315 3.34315 3 5 3H19C20.6546 3 22 4.33733 22 5.99648V16.0011C22 17.6587 20.6561 19 19 19H7.27338C7.09193 19 6.9139 19.0494 6.75836 19.1428L3.51503 21.0916C3.20611 21.2772 2.82123 21.2822 2.50757 21.1047C2.19391 20.9273 2 20.5948 2 20.2344V6Z" 
        fill={props.svgColor}
      />
    </svg>
  )
};

export default CommentIcon;
