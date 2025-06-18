import React from 'react';
import styled from 'styled-components';
import SortbyDropdown from '../Dropdown';
import FilterMenu from '../FilterMenu';
import Stack from '../Stack';
import IconButton from '../common/buttons/IconButton';
import { RowContainer } from './Layout';
import { theme } from '../../styles/theme';
import { FilterIcon, EyeIcon, GridIcon, DotGridIcon, ArrowLeftIcon, ChevronRightIcon, ChevronLeftSmallIcon } from '../common/Icon';
import TextButton from '../common/buttons/TextButton';

const GridControls = ({ 
  filterVisibility, 
  toggleFilterVisibility, 
  numberVisibility, 
  toggleNumberVisibility, 
  zoomGrid, 
  setZoomGrid,
  toggleGridType, 
  handleSortOptionChange, 
  handleFilterOptionsChange, 
  selectedFilterOptions,
  filtersEnabled,
  initialOption,
  includeRelevance
}) => {

  const filterCount = Object.values(selectedFilterOptions || {})
  .reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
  
  return (
    <RowContainer>
      <Stack horizontal={true} center={true} style={{gap: '.75rem'}}>
        {filtersEnabled && (
          <FilterButtonWrapper>
            <TextButton onClick={toggleFilterVisibility}>
              {filterVisibility ? (
                <ChevronLeftSmallIcon size={'1.125rem'} color={theme.colors.text.primary} />
              ) : (
                <FilterIcon size={'1.125rem'} color={theme.colors.text.primary} />
              )}
              <LabelText>Filters</LabelText>
            </TextButton>
            {filterCount > 0 && (
              <FilterCountBadge>{filterCount}</FilterCountBadge>
            )}
          </FilterButtonWrapper>
        )}
        {/* <IconButton onClick={toggleNumberVisibility}>
          <EyeIcon size={'1.25rem'} color={numberVisibility ? theme.colors.text.primary : theme.colors.text.tertiary}></EyeIcon>
        </IconButton> */}
        <ToggleContainer>
          <SlidingBackground active={zoomGrid} />
          <GridButton
            onClick={() => toggleGridType('grid')}
            active={zoomGrid}
            aria-label="Grid view"
          >
            <GridIcon size={'1.125rem'} />
          </GridButton>
          <DotButton
            onClick={() => toggleGridType('dot')}
            active={!zoomGrid}
            aria-label="Dot view"
          >
            <DotGridIcon size={'1.125rem'} />
          </DotButton>
        </ToggleContainer>
        <NumberToggleContainer>
          <Switch
            checked={numberVisibility}
            onClick={toggleNumberVisibility}
            aria-label="Toggle number visibility"
          >
            <SwitchCircle checked={numberVisibility} />
          </Switch>
          <SwitchLabel>Hide info</SwitchLabel>
        </NumberToggleContainer>
      </Stack>
      <SortbyDropdown 
        onOptionSelect={handleSortOptionChange} 
        initialOption={initialOption}
        includeRelevance={includeRelevance}
      />
    </RowContainer>
  );
};

const FilterCountBadge = styled.div`
  position: absolute;
  top: -6px;
  right: -4px;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.625rem;
  background: ${theme.colors.background.dark};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.75rem;
  line-height: 1rem;
  color: ${theme.colors.text.white};
  margin: 0;
  pointer-events: none;
  z-index: 2;
`;

const FilterButtonWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const LabelText = styled.span`
  color: ${theme.colors.text.primary};
  @media (max-width: 630px) {
    display: none;
  }
`;

const ToggleContainer = styled.div`
  position: relative;
  height: 2.75rem;
  min-height: 2.75rem;
  padding: .125rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${theme.colors.background.primary};
  border-radius: 1.375rem;
  box-sizing: border-box;
  border: none;
  margin: 0;
  width: 6.75rem;
  overflow: hidden;
`;

const SlidingBackground = styled.div`
  position: absolute;
  top: 0.125rem;
  left: ${({ active }) => (active ? '0.125rem' : 'calc(50%)')};
  width: 3.25rem;
  height: 2.5rem;
  background: ${theme.colors.background.white};
  border-radius: 1.25rem;
  transition: left 200ms cubic-bezier(.4,0,.2,1);
  z-index: 1;
`;

const GridButton = styled.button`
  z-index: 2;
  width: 3.25rem;
  min-width: 3.25rem;
  height: 2.5rem;
  min-height: 2.5rem;
  border-radius: 1.625rem;
  border: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  transition: color 200ms;
  svg {
    fill: ${({ active }) => active ? theme.colors.text.primary : theme.colors.text.secondary};
    transition: fill 200ms;
  }
`;

const DotButton = styled(GridButton)`
  // Inherit all styles from GridButton
`;

const NumberToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: .375rem;
`;

const Switch = styled.button`
  width: 2.5rem;
  height: 1.25rem;
  border-radius: .625rem;
  border: none;
  background: ${({ checked }) =>
    checked ? theme.colors.background.primary : theme.colors.background.dark};
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background 200ms;
  position: relative;
`;

const SwitchCircle = styled.span`
  width: .75rem;
  height: .75rem;
  border-radius: 50%;
  background: ${({ checked }) =>
    checked ? theme.colors.background.secondary : theme.colors.background.white};
  transition: background 200ms, transform 200ms;
  // transform: ${({ checked }) => (checked ? 'translateX(1.25rem)' : 'translateX(0)')};
  position: absolute;
  left: .125rem;
  top: 50%;
  transform: ${({ checked }) =>
    checked
      ? 'translateX(0.25rem) translateY(-50%)'
      : 'translateX(1.25rem) translateY(-50%)'};
`;

const SwitchLabel = styled.span`
  color: ${theme.colors.text.secondary};
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5rem;
  margin: 0;
  padding: 0;

  @media (max-width: 480px) {
    display: none;
  }
`;

export default GridControls;
