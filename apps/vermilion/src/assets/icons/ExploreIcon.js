import React from 'react';

const ExploreIcon = (props) => {

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
        d="M15.9806 9.19613C16.0462 8.86827 15.9435 8.52933 15.7071 8.29291C15.4707 8.05649 15.1318 7.95386 14.8039 8.01944L9.8039 9.01944C9.40804 9.09861 9.09861 9.40804 9.01944 9.8039L8.01944 14.8039C7.95386 15.1318 8.05649 15.4707 8.29291 15.7071C8.52933 15.9435 8.86827 16.0462 9.19613 15.9806L14.1961 14.9806C14.592 14.9014 14.9014 14.592 14.9806 14.1961L15.9806 9.19613ZM10.2748 13.7253L10.8499 10.8499L13.7253 10.2748L13.1502 13.1502L10.2748 13.7253Z" 
        fill={props.svgColor}
      />
      <path 
        fill-rule="evenodd" 
        clip-rule="evenodd" 
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z"             fill={props.svgColor}
      />
    </svg>
  )
};

export default ExploreIcon;