import { useState } from 'react';

interface UseGridControlsOptions {
  initialZoomGrid?: boolean;
  initialNumberVisibility?: boolean;
  initialFilterVisibility?: boolean;
  initialSortOption?: string;
  initialFilterOptions?: Record<string, string[]>;
}

export const useGridControls = (options: UseGridControlsOptions = {}) => {
  const {
    initialZoomGrid = true,
    initialNumberVisibility = true,
    initialFilterVisibility = false,
    initialSortOption = 'newest',
    initialFilterOptions = {"Content Type": [], "Satributes": [], "Charms": []}
  } = options;

  const [zoomGrid, setZoomGrid] = useState(initialZoomGrid);
  const [numberVisibility, setNumberVisibility] = useState(initialNumberVisibility);
  const [filterVisibility, setFilterVisibility] = useState(initialFilterVisibility);
  const [selectedSortOption, setSelectedSortOption] = useState(initialSortOption);
  const [selectedFilterOptions, setSelectedFilterOptions] = useState(initialFilterOptions);

  const toggleNumberVisibility = () => setNumberVisibility(!numberVisibility);
  const toggleFilterVisibility = () => setFilterVisibility(!filterVisibility);
  const toggleGridType = () => setZoomGrid(!zoomGrid);

  const handleSortOptionChange = (option: string) => setSelectedSortOption(option);
  const handleFilterOptionsChange = (options: Record<string, string[]>) => setSelectedFilterOptions(options);

  return {
    // State
    zoomGrid,
    numberVisibility,
    filterVisibility,
    selectedSortOption,
    selectedFilterOptions,
    
    // Setters
    setZoomGrid,
    
    // Handlers
    toggleNumberVisibility,
    toggleFilterVisibility,
    toggleGridType,
    handleSortOptionChange,
    handleFilterOptionsChange,
  };
};