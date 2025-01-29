import React from 'react';

const EyeIcon = (props) => {

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
        d="M12 2C12.5523 2 13 2.44772 13 3V4.29283C14.5345 4.42455 16.0483 4.86003 17.4454 5.59929L18.1523 4.46963C18.4453 4.00146 19.0623 3.85944 19.5305 4.15242C19.9987 4.4454 20.1407 5.06244 19.8477 5.5306L19.1263 6.68334C20.672 7.87931 21.9904 9.51615 22.9138 11.5939C23.0287 11.8524 23.0287 12.1476 22.9138 12.4061C18.5619 22.198 5.43811 22.198 1.08619 12.4061C0.97127 12.1476 0.971271 11.8524 1.08619 11.5939C1.95509 9.63883 3.17367 8.07414 4.6023 6.8998L3.67879 5.57072C3.36364 5.11718 3.47584 4.49403 3.92938 4.17889C4.38292 3.86374 5.00607 3.97593 5.32121 4.42948L6.25012 5.76631C7.7305 4.92534 9.35328 4.43418 11 4.29283V3C11 2.44772 11.4477 2 12 2ZM20.8966 12C17.1404 19.6667 6.85956 19.6667 3.10343 12C6.85955 4.33334 17.1404 4.33334 20.8966 12ZM12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10ZM8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12Z" 
        fill={props.svgColor}
      />
    </svg>
  )
};

export default EyeIcon;