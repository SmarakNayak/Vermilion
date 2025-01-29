import React from 'react';

const PlayIcon = (props) => {

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
        d="M12.866 3.5C12.6874 3.1906 12.3573 3 12 3C11.6427 3 11.3126 3.1906 11.134 3.5L7.66986 9.5C7.49123 9.8094 7.49123 10.1906 7.66986 10.5C7.8485 10.8094 8.17862 11 8.53589 11H15.4641C15.8214 11 16.1515 10.8094 16.3301 10.5C16.5088 10.1906 16.5088 9.8094 16.3301 9.5L12.866 3.5ZM12 6L13.732 9H10.2679L12 6Z"
        fill={props.svgColor}
      />
      <path 
        fill-rule="evenodd" 
        clip-rule="evenodd" 
        d="M3 17C3 14.7909 4.79086 13 7 13C9.20914 13 11 14.7909 11 17C11 19.2091 9.20914 21 7 21C4.79086 21 3 19.2091 3 17ZM7 15C5.89543 15 5 15.8954 5 17C5 18.1046 5.89543 19 7 19C8.10457 19 9 18.1046 9 17C9 15.8954 8.10457 15 7 15Z"
        fill={props.svgColor}
      />
      <path 
        fill-rule="evenodd" 
        clip-rule="evenodd" 
        d="M13 14C13 13.4477 13.4477 13 14 13H20C20.5523 13 21 13.4477 21 14V20C21 20.5523 20.5523 21 20 21H14C13.4477 21 13 20.5523 13 20V14ZM15 19H19V15H15V19Z"
        fill={props.svgColor}
      />
    </svg>
  )
};

export default PlayIcon;