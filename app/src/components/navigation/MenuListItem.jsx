import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../styles/theme';

const MenuListItem = ({ 
  link, 
  action, 
  isStandard, 
  icon: IconComponent,
  title,
  subtitle,
  tag
}) => {
  return (
    <StyledMenuItem 
      to={link} 
      onClick={action} 
      $isStandard={isStandard}
    >
      <LeftSection>
        <IconContainer $isStandard={isStandard}>
          <IconComponent 
            size="1.25rem" 
            color={isStandard ? theme.colors.text.primary : theme.colors.background.verm} 
          />
        </IconContainer>
        <TextContainer>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </TextContainer>
      </LeftSection>
      
      {tag && <TagText $isStandard={isStandard}>{tag}</TagText>}
    </StyledMenuItem>
  );
};

const StyledMenuItem = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  padding: 0.375rem 0.5rem;
  border-radius: 0.75rem;
  background-color: ${theme.colors.background.white};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  text-decoration: none;
  transition: all 200ms ease;

  &:hover {
    background-color: ${theme.colors.background.primary};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0; 
  flex: 1; 
  overflow: hidden; 
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; 
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.625rem;
  background-color: ${props => props.$isStandard ? theme.colors.background.primary : theme.colors.background.vermPale};
  border: 1px solid ${props => props.$isStandard ? theme.colors.border : theme.colors.background.vermBorder};
  border-radius: 0.75rem;
  box-sizing: border-box;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 2.75rem;
  min-width: 0; 
  overflow: hidden;
`;

const Title = styled.div`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Subtitle = styled.div`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.secondary};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const TagText = styled.div`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${props => props.$isStandard ? theme.colors.text.secondary : theme.colors.background.verm}; 
  white-space: nowrap;
  flex-shrink: 0; 
  margin-left: 0.75rem;
  
  @media (max-width: 400px) {
    display: none; 
  }
`;

export default MenuListItem;
