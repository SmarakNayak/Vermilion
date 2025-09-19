import React from 'react';
import styled from 'styled-components';
import theme from '../../styles/theme';
import { EraseIcon } from './Icon';
import IconButton from './buttons/IconButton';

const DeleteButton = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
`;

const Wrapper = styled.div<{ canRemove: boolean }>`
  position: relative;

  &:hover ${DeleteButton} {
    opacity: ${props => props.canRemove ? 1 : 0};
  }
`;

interface RemoveOverlayProps {
  canRemove: boolean;
  onRemove: () => void;
  children: React.ReactNode;
}

export const RemoveOverlay: React.FC<RemoveOverlayProps> = ({
  canRemove,
  onRemove,
  children
}) => {
  return (
    <Wrapper canRemove={canRemove}>
      {children}
      {canRemove && (
        <DeleteButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <IconButton
            onClick={() => {
              onRemove();
            }}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              width: '2rem',
              height: '2rem',
              minWidth: '2rem',
              minHeight: '2rem'
            }}
          >
            <EraseIcon size={'1rem'} color={theme.colors.text.primary} className="" />
          </IconButton>
        </DeleteButton>
      )}
    </Wrapper>
  );
};