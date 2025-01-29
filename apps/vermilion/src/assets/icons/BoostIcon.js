import React from 'react';

const BoostIcon = (props) => {

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
        d="M16 8C15.4477 8 15 7.55228 15 7C15 6.44772 15.4477 6 16 6H21C21.5523 6 22 6.44772 22 7V12C22 12.5523 21.5523 13 21 13C20.4477 13 20 12.5523 20 12V9.41421L14.7071 14.7071C14.3166 15.0976 13.6834 15.0976 13.2929 14.7071L10 11.4142L3.70711 17.7071C3.31658 18.0976 2.68342 18.0976 2.29289 17.7071C1.90237 17.3166 1.90237 16.6834 2.29289 16.2929L9.29289 9.29289C9.68342 8.90237 10.3166 8.90237 10.7071 9.29289L14 12.5858L18.5858 8H16Z" 
        fill={props.svgColor}
      />
    </svg>
  )
};

export default BoostIcon;