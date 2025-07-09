import theme from "../../styles/theme";

export const Logo = ({ 
  size,
  colorOuter1,
  colorOuter2,
  colorOuter3,
}) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path className="variable-color-outer-3" d="M37.5 86L3 26C29.928 32.9491 45.3417 33.352 72 26L37.5 86Z" fill={colorOuter3}/>
    <path className="variable-color-outer-2" d="M146.5 86L112 26C138.928 32.9491 154.342 33.352 181 26L146.5 86Z" fill={colorOuter2}/>
    <path className="variable-color-outer-2" d="M256 86L221 26C248.318 32.9491 263.955 33.352 291 26L256 86Z" fill={colorOuter2}/>
    <path className="variable-color-outer-2" d="M365.5 86L331 26C357.928 32.9491 373.342 33.352 400 26L365.5 86Z" fill={colorOuter2}/>
    <path className="variable-color-outer-3" d="M474.5 86L440 26C466.928 32.9491 482.342 33.352 509 26L474.5 86Z" fill={colorOuter3}/>
    <path className="variable-color-outer-2" d="M91.5 186L57 126C83.928 132.949 99.3417 133.352 126 126L91.5 186Z" fill={colorOuter2}/>
    <path className="variable-color-outer-1" d="M201 186L166 126C193.318 132.949 208.955 133.352 236 126L201 186Z" fill={colorOuter1}/>
    <path className="variable-color-outer-1" d="M311 186L276 126C303.318 132.949 318.955 133.352 346 126L311 186Z" fill={colorOuter1}/>
    <path className="variable-color-outer-2" d="M420.5 186L386 126C412.928 132.949 428.342 133.352 455 126L420.5 186Z" fill={colorOuter2}/>
    <path className="variable-color-outer-2" d="M37 286L2.5 226C29.428 232.949 44.8417 233.352 71.5 226L37 286Z" fill={colorOuter2}/>
    <path className="variable-color-outer-1" d="M146.5 286L111.5 226C138.818 232.949 154.455 233.352 181.5 226L146.5 286Z" fill={colorOuter1}/>
    <path d="M256.5 286L221.5 226C248.818 232.949 264.455 233.352 291.5 226L256.5 286Z" fill={theme.colors.background.verm}/>
    <path className="variable-color-outer-1" d="M366 286L331.5 226C358.428 232.949 373.842 233.352 400.5 226L366 286Z" fill={colorOuter1}/>
    <path className="variable-color-outer-2" d="M475 286L440.5 226C467.428 232.949 482.842 233.352 509.5 226L475 286Z" fill={colorOuter2}/>
    <path className="variable-color-outer-2" d="M91.5 386L57 326C83.928 332.949 99.3417 333.352 126 326L91.5 386Z" fill={colorOuter2}/>
    <path className="variable-color-outer-1" d="M201 386L166 326C193.318 332.949 208.955 333.352 236 326L201 386Z" fill={colorOuter1}/>
    <path className="variable-color-outer-1" d="M311 386L276 326C303.318 332.949 318.955 333.352 346 326L311 386Z" fill={colorOuter1}/>
    <path className="variable-color-outer-2" d="M420.5 386L386 326C412.928 332.949 428.342 333.352 455 326L420.5 386Z" fill={colorOuter2}/>
    <path className="variable-color-outer-3" d="M37 486L2.5 426C29.428 432.949 44.8417 433.352 71.5 426L37 486Z" fill={colorOuter3}/>
    <path className="variable-color-outer-2" d="M146.5 486L111.5 426C138.818 432.949 154.455 433.352 181.5 426L146.5 486Z" fill={colorOuter2}/>
    <path className="variable-color-outer-2" d="M256.5 486L221.5 426C248.818 432.949 264.455 433.352 291.5 426L256.5 486Z" fill={colorOuter2}/>
    <path className="variable-color-outer-2" d="M366 486L331.5 426C358.428 432.949 373.842 433.352 400.5 426L366 486Z" fill={colorOuter2}/>
    <path className="variable-color-outer-3" d="M475 486L440.5 426C467.428 432.949 482.842 433.352 509.5 426L475 486Z" fill={colorOuter3}/>
  </svg>
)
