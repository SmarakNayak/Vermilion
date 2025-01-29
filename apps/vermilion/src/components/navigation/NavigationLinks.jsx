import PropTypes from 'prop-types'
import styled from 'styled-components'
import { ChevronDownSmallIcon } from '../common/Icon'

const NavContainer = styled.nav`
  display: flex;
  align-items: center;
  gap: .5rem;

  @media (max-width: 630px) {
    display: none;
  }
`;

const NavLink = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .25rem;
  font-family: relative-bold-pro;
  height: 2.5rem;
  padding: 0 1rem;
  border-radius: 1.25rem;
  color: ${({theme}) => `${theme.colors.text.primary}`};
  background-color: ${props => props.active ? '#000000' : 'transparent'};
  cursor: pointer;
  transition: background-color 200ms ease;

  &:hover {
    background-color: ${props => props.active ? '#000000' : '#FBFAF9'};
  }
`;

const NavigationLinks = () => {
  return (
    <NavContainer>
      <NavLink>
        Explore
        <ChevronDownSmallIcon color={'#000'} size={'1rem'} />
      </NavLink>
      <NavLink>Discover</NavLink>
      <NavLink>Search</NavLink>
    </NavContainer>
  );
}

export default NavigationLinks
