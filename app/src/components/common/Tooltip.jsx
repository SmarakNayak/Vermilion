import React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
import { keyframes, styled } from 'styled-components';
import theme from '../../styles/theme';

const Tooltip = ({children, content}) => {

  return (
    <TooltipPrimitive.Provider delayDuration={0}>
      <TooltipPrimitive.Root delayDuration={0}>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <StyledContent 
          sideOffset={4} 
          align='center' 
          side='top'
          collisionPadding={20}
          avoidCollisions
        >
          {content}
        </StyledContent>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
};

//Enter animations
const slideUpAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(0.25rem)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const slideDownAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-0.25rem)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

// Exit animations
const slideDownAndFadeOut = keyframes({
  '0%': { opacity: 1, transform: 'translateY(0)' },
  '100%': { opacity: 0, transform: 'translateY(0.25rem)' },
});

const slideUpAndFadeOut = keyframes({
  '0%': { opacity: 1, transform: 'translateY(0)' },
  '100%': { opacity: 0, transform: 'translateY(-0.25rem)' },
});

const StyledContent = styled(TooltipPrimitive.Content)`
  border-radius: 0.75rem;
  box-sizing: border-box;
  padding: 0.5rem 0.75rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.75rem;
  line-height: 1rem;
  // text-align: center;
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.white};
  border: 1px solid ${theme.colors.border};
  box-shadow: rgba(10, 10, 10, 0.1) 0px 4px 8px 0px;
  max-width: calc(100vw - 4.5rem); 
  width: auto;
  white-space: normal;
  word-wrap: break-word;
  z-index: 9999;

  @media (prefers-reduced-motion: no-preference) {
    animation-duration: 200ms;
      animation-timing-function: ease-in-out;
    will-change: transform, opacity;

    &[data-state="delayed-open"] {
      &[data-side="top"] {
        animation-name: ${slideUpAndFade};
      }
      &[data-side="bottom"] {
        animation-name: ${slideDownAndFade};
      }
    }
  }

  &[data-state="closed"] {
    animation-direction: normal;

    &[data-side="top"] {
      animation-name: ${slideDownAndFadeOut};
    }
    &[data-side="bottom"] {
      animation-name: ${slideUpAndFadeOut};
    }
  }

  &[data-state="closed"] {
    opacity: 0;
    pointer-events: none; /* Prevent interaction during exit */
  }
`;

export default Tooltip;
