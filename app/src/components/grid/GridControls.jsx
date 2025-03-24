import React from 'react';
import SortbyDropdown from '../Dropdown';
import FilterMenu from '../FilterMenu';
import Stack from '../Stack';
import IconButton from '../common/buttons/IconButton';
import { RowContainer } from './Layout';
import { theme } from '../../styles/theme';
import { FilterIcon, EyeIcon, GridIcon, DotGridIcon } from '../common/Icon';

const GridControls = ({ 
  filterVisibility, 
  toggleFilterVisibility, 
  numberVisibility, 
  toggleNumberVisibility, 
  zoomGrid, 
  toggleGridType, 
  handleSortOptionChange, 
  handleFilterOptionsChange, 
  selectedFilterOptions,
  filtersEnabled
}) => {
  return (
    <RowContainer>
      <Stack horizontal={true} center={false} style={{gap: '.75rem'}}>
        {filtersEnabled && (
          <IconButton onClick={toggleFilterVisibility}>
            <FilterIcon size={'1.25rem'} color={theme.colors.text.primary} />
          </IconButton>
        )}
        <IconButton onClick={toggleNumberVisibility}>
          <EyeIcon size={'1.25rem'} color={numberVisibility ? theme.colors.text.primary : theme.colors.text.tertiary}></EyeIcon>
        </IconButton>
        <IconButton onClick={toggleGridType}>
          {zoomGrid ? (
            <GridIcon size={'1.25rem'} color={theme.colors.text.primary} />
          ) : (
            <DotGridIcon size={'1.25rem'} color={theme.colors.text.primary} />
          )}
        </IconButton>
      </Stack>
      <SortbyDropdown onOptionSelect={handleSortOptionChange} />
    </RowContainer>
  );
};

export default GridControls;
