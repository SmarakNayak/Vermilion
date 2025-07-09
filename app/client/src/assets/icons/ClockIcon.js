import React from 'react';

const ClockIcon = (props) => {

  return (
    <svg 
      width={props.svgSize}
      height={props.svgSize}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8V11.1716C11 11.9672 11.3161 12.7303 11.8787 13.2929L14.7929 16.2071C15.1834 16.5976 15.8166 16.5976 16.2071 16.2071C16.5976 15.8166 16.5976 15.1834 16.2071 14.7929L13.2929 11.8787C13.1054 11.6911 13 11.4368 13 11.1716V8Z" 
        fill={props.svgColor}
      />
      <path 
      fill-rule="evenodd" 
      clip-rule="evenodd" 
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z" 
      fill={props.svgColor}
      />
    </svg>
  )
};

export default ClockIcon;