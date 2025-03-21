import { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { BlockIcon, CoinIcon, CrossIcon, GalleryIcon, GridIcon, ImageIcon, SearchIcon, SparklesIcon, WalletIcon } from '../common/Icon';
import Spinner from '../Spinner';
import { theme } from '../../styles/theme';
import MenuListItem from './MenuListItem';
import { addCommas, formatAddress } from '../../utils/format'

const SearchMenu = ({ isOpen, closeMenu }) => {
  // with search functionality
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchResults, setSearchResults] = useState({});
  const [addressData, setAddressData] = useState(null);
  const [blockData, setBlockData] = useState(null);
  const [collectionData, setCollectionData] = useState([]);
  const [inscriptionData, setInscriptionData] = useState(null);
  const [satData, setSatData] = useState(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  
  const isNumberInput = !isNaN(searchInput);
  
  // Focus the input when the menu opens with a short delay to ensure DOM is ready
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Use a small timeout to ensure the DOM is fully rendered and transitions completed
      const focusTimer = setTimeout(() => {
        inputRef.current.focus();
      }, 50);
      
      return () => clearTimeout(focusTimer);
    }
  }, [isOpen]);
  
  // Handle clicks inside the menu (prevent closing)
  const handleMenuClick = (e) => {
    e.stopPropagation();
  };
  
  // Debounced search function
  const debouncedSearch = useCallback((term) => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (term.trim() === '') {
      setIsTyping(false);
      setIsLoading(false);
      setAddressData(null);
      setBlockData(null);
      setCollectionData([]);
      setInscriptionData(null);
      setSatData(null);
      return;
    }
    
    setIsTyping(true);
    setIsLoading(true);
    
    // Timeout for the search to prevent too many requests
    searchTimeoutRef.current = setTimeout(() => {
      fetchSearchResults(term);
    }, 200); // 200ms debounce delay
  }, []);
  
  const handleSearch = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setSearchInput(value); // Store original input
    
    // Clear previous results first
    setAddressData(null);
    setBlockData(null);
    setCollectionData([]);
    setInscriptionData(null);
    setSatData(null);
    
    // Remove commas for search functionality
    const searchInputFormatted = value.replace(/,/g, '');
    debouncedSearch(searchInputFormatted);
  };
  
  const fetchSearchResults = async (term) => {
    if (term?.trim() === "") {
      setIsTyping(false);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true); // Show loading state
      
      const response = await fetch(`/api/search/${term}`);
      const json = await response.json();
      
      setSearchResults(json);
      setAddressData(json['address']);
      setBlockData(json['block']);
      setCollectionData(json['collections'] || []);
      setInscriptionData(json['inscription']);
      setSatData(json['sat']);
      console.log("Search results:", json); // Debugging
    } catch (error) {
      console.error("Search error:", error);
      
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };
  
  // Clear search term when menu closes
  useEffect(() => {
    if (!isOpen) {
      setSearchInput('');
      setIsLoading(false);
      setIsTyping(false);
      setCollectionData([]);
      setAddressData(null);
      setInscriptionData(null);
      setSatData(null);
      
      // Clear any pending search timeouts
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    }
  }, [isOpen]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  const handleLinkClick = () => {
    closeMenu();
  };
  
  const showResults = searchInput && !isTyping && !isLoading;
  
  return (
    <MenuContainer ref={menuRef} onClick={handleMenuClick}>
      <SearchInputSection>
        <SearchInputWrapper>
          <IconWrapper>
            <SearchIcon 
              size={"1.25rem"} 
              color={searchInput ? theme.colors.text.primary : theme.colors.text.secondary} 
            />
          </IconWrapper>
          <SearchInput 
            ref={inputRef}
            placeholder="Search inscriptions, collections, or keywords..."
            value={searchInput}
            onChange={handleSearch}
            autoFocus={isOpen}
          />
          {isLoading && (
            <SpinnerWrapper>
              <Spinner />
            </SpinnerWrapper>
          )}
        </SearchInputWrapper>
        <CloseButton onClick={closeMenu}>
          <CrossIcon size="1.25rem" color={theme.colors.text.secondary} />
        </CloseButton>
      </SearchInputSection>      
      <MenuContent>
        {!searchInput ? (
          <>          
            <LinkSection>
              <MenuListItem
                link="/search"
                action={closeMenu}
                icon={SparklesIcon}
                isStandard={false}
                title="Go to Search page"
                subtitle="Search by keyword or upload an image to find relevant inscriptions"
              />
            </LinkSection>
          </>
        ) : (isLoading || isTyping) ? (
          <LoadingState>
            <SkeletonItem>
              <SkeletonIconWrapper />
              <SkeletonText />
            </SkeletonItem>
          </LoadingState>
        ) : (
          <LinkSection>
            <MenuListItem
              link={`/search/${searchInput}`}
              action={closeMenu}
              icon={SparklesIcon}
              isStandard={false}
              title={`"${searchInput}"`}
              tag="Visual Search"
            />
            {inscriptionData && (
              <MenuListItem
                link={`/inscription/${inscriptionData.number}`}
                action={handleLinkClick}
                icon={ImageIcon}
                isStandard={true}
                title={addCommas(inscriptionData.number)}
                subtitle={inscriptionData.collection_name ? inscriptionData.collection_name : null}
                tag="Inscription"
              />
            )}
            {collectionData && collectionData.length > 0 && (
              <>
                {collectionData.map((result) => (
                  <MenuListItem
                    key={result.id}
                    link={`/collection/${result.collection_symbol}`}
                    action={handleLinkClick}
                    icon={GalleryIcon}
                    isStandard={true}
                    title={result.name}
                    subtitle={`${addCommas(result.supply)} items`}
                    tag="Collection"
                  />
                ))}
              </>
            )}
            {addressData && (
              <MenuListItem
                link={`/address/${addressData}`}
                action={handleLinkClick}
                icon={WalletIcon}
                isStandard={true}
                title={formatAddress(addressData)}
                tag="Address"
              />
            )} 
            {blockData && (
              <MenuListItem
                link={`/block/${searchInput}`}
                action={handleLinkClick}
                icon={BlockIcon}
                isStandard={true}
                title={addCommas(blockData?.block_number)}
                subtitle={`${blockData?.block_inscription_count > 0 ? addCommas(blockData?.block_inscription_count) : "0"} items`}
                tag="Block"
              />
            )}
            {satData && (
              <MenuListItem
                link={`/sat/${satData?.sat}`}
                action={handleLinkClick}
                icon={CoinIcon}
                isStandard={true}
                title={addCommas(satData?.sat)}
                subtitle={`${satData?.sat_inscription_count > 0 ? addCommas(satData?.sat_inscription_count) : "0"} items`}
                tag="Sat"
              />
            )}
          </LinkSection>
        )}
      </MenuContent>
    </MenuContainer>
  );
};

const MenuContainer = styled.div`
  position: absolute;
  top: 5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;

  width: 90%;
  max-width: 40rem;
  background-color: ${theme.colors.background.white};
  border-radius: 1.5rem;
  overflow: hidden;
  z-index: 110;
  box-shadow: ${theme.shadows.soft};

  @media (max-width: 630px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: 100%;
    height: 100vh;
    transform: none;
    border-radius: 0;
    display: flex;
    flex-direction: column;
  }
`;

const SearchInputSection = styled.div`
  display: flex;
  align-items: center;
  padding: 0.875rem 1.5rem;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  position: relative;

  @media (max-width: 630px) {
    transition: all 200ms ease;
    justify-content: space-between;
    padding: 1rem;
  }
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
`;

const CloseButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 1.25rem;
  background-color: ${theme.colors.background.white};
  cursor: pointer;
  transition: all 200ms ease;
  margin-left: 0.5rem;
  flex-shrink: 0;

  &:hover {
    background-color: ${theme.colors.background.primary};
  }

  &:active {
    transform: scale(0.96);
  }
  
  @media (max-width: 630px) {
    display: flex;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  flex: 1;
  width: 0; 
  border: none;
  background: transparent;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.75rem;
  padding: 0.375rem 0;
  margin: 0;
  color: ${theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

const ResultsSection = styled.div`
  padding: 0.5rem 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: .75rem;
`;

const MenuContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1.25rem 1.25rem;
  box-sizing: border-box;
  width: 100%;
  gap: .75rem;
  transition: all 200ms ease;

  @media (max-width: 630px) {
    padding: 0.5rem 0.5rem 1.25rem;
  }
`;

const LinkSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
`;

const GroupTitle = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: 0.875rem;
  font-family: ${theme.typography.fontFamilies.medium};
  line-height: 1.25rem;
  padding-left: 0.5rem;
  margin: 0 0 0.25rem 0; 
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 0.5rem;
  border: none;
  border-radius: 0.5rem;
  background-color: transparent;
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  text-align: left;
  text-transform: capitalize;
  cursor: pointer;
  transition: background-color 150ms ease;
  
  &:hover {
    background-color: ${theme.colors.background.primary};
  }
`;

const SpinnerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  color: ${theme.colors.text.secondary};
  text-align: center;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  gap: 1rem;
`;

const SkeletonItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  border-radius: 0.5rem;
`;

const SkeletonIconWrapper = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background-color: ${theme.colors.background.secondary};
  margin-right: 0.75rem;
  flex-shrink: 0;
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 0.4; }
    100% { opacity: 0.6; }
  }
`;

const SkeletonText = styled.div`
  width: 10rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  background-color: ${theme.colors.background.secondary};
  animation: pulse 1.5s ease-in-out infinite;
`;

export default SearchMenu;
