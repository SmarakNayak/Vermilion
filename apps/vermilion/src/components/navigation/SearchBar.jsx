import PropTypes from 'prop-types';
import styled from 'styled-components';
import { SearchIcon } from '../common/Icon';
import theme from '../../styles/theme';

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 100%;
  margin: 0;

  @media (max-width: 630px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  height: 2.5rem;
  padding: 0 1rem 0 2.75rem;
  border: 2px solid transparent;
  border-radius: 1.5rem;
  box-sizing: border-box;
  background-color: ${({theme}) => `${theme.colors.background.primary}`};
  color: ${({theme}) => `${theme.colors.text.secondary}`};
  font-family: relative-medium-pro;
  font-size: 1rem;
  transition: all 200ms ease;

  &:hover {
    border: 2px solid ${({theme}) => `${theme.colors.background.secondary}`};
  }

  &:focus {
    border: 2px solid ${({theme}) => `${theme.colors.background.secondary}`};
    outline: none;
  }

  &::placeholder {
    color: ${({theme}) => `${theme.colors.text.tertiary}`};
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchBar = () => {
  return (
    <SearchContainer>
      <IconWrapper>
        <SearchIcon size="1.25rem" color="#959595" />
      </IconWrapper>
      <SearchInput 
        placeholder="Search inscriptions, collections, and more..."
        type="text"
      />
    </SearchContainer>
  );
};

export default SearchBar;
