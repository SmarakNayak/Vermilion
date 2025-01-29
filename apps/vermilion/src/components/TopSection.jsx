import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { BlockIcon, BoltIcon, BurgerMenuIcon, CrossIcon, DiscoverIcon, GridIcon, LogoutIcon, PlayIcon, SearchIcon, WalletIcon } from './common/Icon';
import SearchMenu from './SearchMenu';
// import Wallet, { getAddress, Address, BitcoinNetworkType, AddressPurpose } from 'sats-connect';
import MenuDropdown from './MenuDropdown';
import ExploreDropdown from './ExploreDropdown';

const TopSection = (props) => {
  const [searchInput, setSearchInput] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [collectionData, setCollectionData] = useState([]);
  const [addressData, setAddressData] = useState(null);
  const [inscriptionData, setInscriptionData] = useState(null);
  const [menuOpen, setMenuOpen] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const [network, setNetwork] = useState('network', BitcoinNetworkType.Mainnet);
  const [addressInfo, setAddressInfo] = useState([]);
  const [shortAddress, setShortAddress] = useState(null);
  const isConnected = addressInfo.length > 0;

  const location = useLocation();

    // Clear search input when the location changes
    useEffect(() => {
      setSearchInput('');
    }, [location]);

  const walletButtonRef = useRef(null);

  const onConnect = async () => {
    console.log("on connect hit")
    if (Wallet === undefined || Wallet === null) {
      console.log('Wallet is undefined or null');
      return;
    }
    const response = await Wallet.request('getAccounts', {
      purposes: [AddressPurpose.Ordinals],
      message: 'Sign in to see your inscriptions on Vermilion.Place',
      network: {
        type: network
      },
    });
    console.log(response);
    if (response.status === 'success') {
      setAddressInfo(response.result);
      console.log(response.result);
      let short_address = response.result[0].address.slice(0, 5) + "..." + response.result[0].address.slice(-5);
      setShortAddress(short_address);
    }
  }

  const onMobileConnect = async () => {
    //Dismiss mobile menu so you can see wallet prompt
    setShowMobileMenu(false);
    await onConnect();
    //Bring mobile menu back up once onConnect has completed
    setShowMobileMenu(true);
  }

  const onDisconnect = () => {
    console.log("on disconnect hit")
    Wallet.disconnect();
    setAddressInfo([]);
    setOptionsVisible(false);
  };

  const onWalletClick = () => {
    console.log("options hit");
    setOptionsVisible(!optionsVisible);
  }

  const onWalletMenuClose = () => {
    setOptionsVisible(false);
  }

  const handleTextChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setSearchInput(value); // Keep the original input with commas
    setMenuOpen(value.trim() !== '');
    if (value.trim() !== '') {
      // Remove commas for search functionality, but keep original input for display
      const searchTerm = value.replace(/,/g, '');
      fetchTextSearch(searchTerm);
      setCollectionData([]);
      setAddressData(null);
      setInscriptionData(null);
    }
  };  

  const handleKeyPress = (e) => {
    if (e.key === 13) {      
    }
  };

  // const handleClick = (e) => {
  //   if (searchInput.length > 0) {
  //     setMenuOpen(e.target.value.trim() !== '');
  //   }
  // }

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (searchInput.trim() === "") {
      setIsError(true);
    } else {
      // Remove commas from the input if it's a number
      const searchTerm = searchInput.replace(/,/g, '');
      fetchTextSearch(searchTerm);
      setIsError(false);
    }
  };

  const fetchTextSearch = async (searchTerm) => {
    if (searchTerm?.trim() === "") {
      return
    } else {
      setIsLoading(true); // Start loading
      const response = await fetch("/api/search/" + searchTerm);
      let json = await response.json();
      setSearchResults(json);
      setCollectionData(json['collections']);
      setAddressData(json['address']);
      setInscriptionData(json['inscription']);
      setIsLoading(false); // End loading
    }
  };

  const toggleMenuVisibility = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const toggleSearchVisibility = () => {
    setShowMobileSearch(!showMobileSearch);
  };

  const closeSearch = () => {
    toggleSearchVisibility();
    setSearchInput('');
  }

  const clearSearch = () => {
    setSearchInput('');
    setMenuOpen(false);
    setCollectionData([]); // clear collection results 
    setAddressData(null); // clear address results
    setInscriptionData(null);
  }

  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path); 
  };

  return (
    <HeaderContainer>
      <NavSection>
        <SiteText to ={'/explore/inscriptions'}>vermilion</SiteText>
        <NavLinkContainer>
          <ExploreDropdown />
          {/* <NavButton onClick={() => handleNavigation('/explore')}>
            Explore
            <ChevronDownSmallIcon size={'1.25rem'} color={'#000000'}></ChevronDownSmallIcon>
          </NavButton> */}
          {/* <NavButton collapse={true} onClick={() => handleNavigation('/discover')}>Discover</NavButton>
          <NavButton collapse={true} onClick={() => handleNavigation('/search')}>Search</NavButton> */}
          <NavButton collapse={true} to={'/discover'}>Discover</NavButton>
          <NavButton collapse={true} to={'/search'}>Search</NavButton>
        </NavLinkContainer>
      </NavSection>

      {/* old code */}
      <SearchContainer mobile={false}>
        <SearchIcon size={'1.25rem'} color={'#959595'}></SearchIcon>
        <form onSubmit={handleTextSubmit}>
          <SearchInput 
            placeholder='Search for inscriptions, collections, blocks, etc.'
            type='text'
            onChange={handleTextChange}
            onKeyDown={handleKeyPress}
            value={searchInput}
            isError={isError}
          />
        </form>
        {searchInput.length > 0 && (
          <ClearButton onClick={clearSearch}>
            <CrossIcon size={'1.25rem'} color={'#959595'}></CrossIcon>
          </ClearButton>
        )}
        {menuOpen && (
          <SearchMenu addressData={addressData} collectionData={collectionData} inscriptionData={inscriptionData} menuOpen={menuOpen} setMenuOpen={setMenuOpen} setShowMobileSearch={setShowMobileSearch} searchInput={searchInput} searchResults={searchResults} />
        )}
      </SearchContainer>
      <ButtonContainer>
        <MenuButton isSearch={true} onClick={toggleSearchVisibility}>
          <SearchIcon size='1.25rem' color='black'></SearchIcon>
        </MenuButton>
        <MenuButton onClick={toggleMenuVisibility}>
          <BurgerMenuIcon size='1.25rem' color='black'></BurgerMenuIcon>
        </MenuButton>

        {/* old link container */}
        {/* <LinkContainer>
          <UnstyledLink to={'/explore/'}>
            <LinkButton>Explore</LinkButton>
          </UnstyledLink>
          <UnstyledLink to={'/discover'}>
            <LinkButton>Discover</LinkButton>
          </UnstyledLink>
          <UnstyledLink to={'/search'}>
            <LinkButton>Search</LinkButton>
          </UnstyledLink>
        </LinkContainer> */}

        {/* Click event to connect wallet */}
        {!isConnected && (
          <ConnectButton onClick={onConnect}>Connect</ConnectButton>
        )}
        {isConnected && (
          <>
            {/* Insert click event to navigate to wallet */}
            <ProfileButton onClick={onWalletClick} ref={walletButtonRef}>
              {shortAddress}
            </ProfileButton>
            <MenuDropdown onWalletClick={onWalletClick} optionsVisible={optionsVisible} onDisconnect={onDisconnect} addressInfo={addressInfo} onWalletMenuClose={onWalletMenuClose} walletButtonRef={walletButtonRef}/>
          </>
        )}
      </ButtonContainer>
      {showMobileSearch && (
        <MobileSearchContainer>
          <MenuHeader>
            <SearchContainer mobile>
              <SearchIcon size={'1.25rem'} color={'#959595'}></SearchIcon>
              <form onSubmit={handleTextSubmit}>
                <SearchInput 
                  placeholder='Search for inscriptions, collections, blocks, etc.'
                  type='text'
                  onChange={handleTextChange}
                  onKeyDown={handleKeyPress}
                  value={searchInput}
                  isError={isError}
                />
              </form>
              {searchInput.length > 0 && (
                <ClearButton onClick={clearSearch}>
                  <CrossIcon size={'1.25rem'} color={'#959595'}></CrossIcon>
                </ClearButton>
              )}
              {menuOpen && (
                <SearchMenu addressData={addressData} collectionData={collectionData} inscriptionData={inscriptionData} menuOpen={menuOpen} setMenuOpen={setMenuOpen} setShowMobileSearch={setShowMobileSearch} searchInput={searchInput} searchResults={searchResults} />
              )}
            </SearchContainer>
            <CloseButton onClick={closeSearch}>
              <CrossIcon size={'1.25rem'} color={'#959595'} />
            </CloseButton>
          </MenuHeader>
        </MobileSearchContainer>
      )}
      {showMobileMenu && (
        <MobileContainer>
          <MenuHeader>
            <SiteText to ={'/explore/inscriptions'}>vermilion</SiteText>
            <CloseButton onClick={toggleMenuVisibility}>
              <CrossIcon size={'1.25rem'} color={'#959595'} />
            </CloseButton>
          </MenuHeader>
          <MenuLinkContainer>
            <UnstyledLink to={'/explore/inscriptions'} onClick={toggleMenuVisibility}>
              <ItemContainer>
                <GridIcon size={'1.25rem'} color={'#000000'} />
                <MenuText>Inscriptions</MenuText>
              </ItemContainer>
            </UnstyledLink>
            <UnstyledLink to={'/explore/blocks'} onClick={toggleMenuVisibility}>
              <ItemContainer>
                <BlockIcon size={'1.25rem'} color={'#000000'} />
                <MenuText>Blocks</MenuText>
              </ItemContainer>
            </UnstyledLink>
            <UnstyledLink to={'/explore/collections'} onClick={toggleMenuVisibility}>
              <ItemContainer>
                <PlayIcon size={'1.25rem'} color={'#000000'} />
                <MenuText>Collections</MenuText>
              </ItemContainer>
            </UnstyledLink>
            <UnstyledLink to={'/discover'} onClick={toggleMenuVisibility}>
              <ItemContainer>
                <DiscoverIcon size={'1.25rem'} color={'#000000'} />
                <MenuText>Discover</MenuText>
              </ItemContainer>
            </UnstyledLink>
            <UnstyledLink to={'/search'} onClick={toggleMenuVisibility}>
              <ItemContainer>
                <BoltIcon size={'1.25rem'} color={'#000000'} />
                <MenuText>Search</MenuText>
              </ItemContainer>
            </UnstyledLink>
            {/* Insert click event to connect wallet */}
            {!isConnected && (
              <MobileButton onClick={onMobileConnect} >Connect</MobileButton>
            )}
            {isConnected && (
              <>
                <Divider />
                <UnstyledLink to={'/address/' + addressInfo?.[0].address} onClick={toggleMenuVisibility}>
                  <ItemContainer>
                    <WalletIcon size={'1.25rem'} color={'#E34234'} />
                    <MenuText>{shortAddress}</MenuText>
                  </ItemContainer>
                </UnstyledLink>
                <UnstyledLink onClick={onDisconnect}>
                  <ItemContainer onClick={onDisconnect} >
                    <LogoutIcon size={'1.25rem'} color={'#000000'} />
                    <MenuText>Disconnect</MenuText>
                  </ItemContainer>
                </UnstyledLink>
              </>
            )}
          </MenuLinkContainer>
        </MobileContainer>
      )}
    </HeaderContainer>
  )
}

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  // flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  position: sticky;
  top: 0;
  width: calc(100% - 6rem);
  z-index: 1;
  padding: 0 3rem;
  margin: 0;
  height: 5rem;
  background-color: #FFFFFF;

  z-index: 2;

  @media (max-width: 864px) {
    width: calc(100% - 3rem);
    padding: 0 1.5rem;
  }
`;

const NavSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
`;

const NavLinkContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;

  @media (max-width: 864px) {
    display: none;
  }
`;

const NavButton = styled(Link)`
  height: 3rem;
  border-radius: 1.5rem;
  border: none;
  margin: 0;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .125rem;
  cursor: pointer;
  font-family: Relative Trial Bold;
  font-size: 1rem;
  background-color: #FFFFFF;
  color: unset;
  text-decoration: unset;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #F5F5F5;
  }

  // @media (max-width: 864px) {
  //   display: ${props => props.collapse ? 'none' : 'flex'}; 
  // }

  // add click event animation
`;

const ConnectButton = styled.button`
  height: 3rem;
  border-radius: 1.5rem;
  border: none;
  padding: 0 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: Relative Trial Bold;
  font-size: 1rem;
  color: #FFFFFF;  
  background-color:#000000;
  transition: 
    transform 150ms ease;
  transform-origin: center center;

  &:active {
    transform: scale(0.96);
  }

  @media (max-width: 864px) {
    display: none;
  }
`;

const ProfileButton = styled.button`
  height: 3rem;
  border-radius: 1.5rem;
  border: none;
  padding: 0 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: Relative Trial Bold;
  font-size: 1rem;
  color: #E34234;  
  background-color:#F5F5F5;
  transition: 
    transform 150ms ease;
  transform-origin: center center;

  &:active {
    transform: scale(0.96);
  }

  @media (max-width: 864px) {
    display: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;

  @media (max-width: 864px) {
    gap: .75rem;
  }
`;

const LinkContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  @media (max-width: 630px) {
    display: none;
  }
`;

const LinkButton = styled.div`
  border-radius: 2rem;
  border: none;
  padding: .5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: Relative Trial Bold;
  font-size: .875rem;
  color: #000000;
  background-color: #FFFFFF;
  transition: all 350ms ease;

  &:hover {
    background-color: #F5F5F5;
  }

  @media (max-width: 425px) {
    padding: 0;
    flex-direction: column;
    align-items: flex-start;

    &:hover {
      background-color: transparent;
    }
  }
`;

const MenuButton = styled.button`
  height: 3rem;
  width: 3rem;
  border-radius: 1.5rem;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:focus {
    transform: scale(0.96);
  }

  // Default to hidden
  display: none;

  // Show the first MenuButton (search) when screen is 630px or smaller
  &:nth-of-type(1) {
    @media (max-width: 630px) {
      display: flex;
    }
  }

  // Show the second MenuButton (hamburger menu) when screen is 864px or smaller
  &:nth-of-type(2) {
    @media (max-width: 864px) {
      display: flex;
    }
  }
`;

const MobileContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #FFFFFF;
  max-width: calc(100% - 3rem);  
  max-height: calc(100% - 2rem);
  margin-right: 0;  
  width: 100%;     
  height: 100%;    
  position: fixed;  
  top: 0;          
  left: 0;          
  z-index: 1000;    
  padding: 1rem 1.5rem;
  gap: 2.5rem;
`;

const MobileSearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #FFFFFF;
  max-width: calc(100% - 3rem);  
  margin-right: 0;  
  width: 100%;     
  position: fixed;  
  top: 0;          
  left: 0;          
  z-index: 1000;    
  padding: 1rem 1.5rem;
  gap: 2.5rem;
`;

const MenuHeader = styled.div`
  display: none;

  @media (max-width: 864px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: .75rem;
  }
`;

const CloseButton = styled.button`
  height: 3rem;
  width: 3rem;
  min-width: 3rem;
  max-width: 3rem;
  border-radius: 1.5rem;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const MenuLinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.5rem;
`;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .75rem;
`;

const MenuText = styled.p`
  font-family: Relative Trial Bold;
  font-size: 1.25rem;
  color: #000000;
  margin: 0;
  padding: 0;
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

const SiteText = styled(Link)`
  font-family: ABC Camera Unlicensed Trial Bold;
  font-size: 1.25rem;
  color: #E34234;
  padding: 0;
  margin: 0;
  cursor: pointer;
  text-decoration: none;
`;

const SearchContainer = styled.div`
  width: 100%;
  // max-width: 25rem;
  height: 3rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #F5F5F5;
  border: none;  
  border-radius: 1.5rem;
  padding: 0 1rem;
  gap: .5rem;
  position: relative;

  @media (max-width: 630px) {
    display: ${props => props.mobile ? 'flex' : 'none'}; 
    max-width: unset;
    width: calc(100% - 2rem);
  }
`;

const MobileButton = styled.button`
  height: 2.5rem;
  width: 100%;
  border-radius: 2rem;
  border: none;
  padding: 0 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: Relative Trial Bold;
  font-size: 1rem;
  color: #FFFFFF;  
  background-color:#000000;
  transition: 
    transform 150ms ease;
  transform-origin: center center;

  &:active {
    transform: scale(0.96);
  }
`;

const SearchInput = styled.input`
  width: auto;
  height: auto;
  border: 2px solid transparent;
  border-radius: 1.5rem;
  transition: all 150ms ease;
  background-color: transparent;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
  outline: none;
  font-family: Relative Trial Medium;
  font-weight: 500;
  color: #000000;
  font-size: 1rem;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 1rem 0 2.5rem;
  box-sizing: border-box;

  &:hover {
    border: 2px solid #E9E9E9;
  }

  &:focus {
    border: 2px solid ${props => props.isError ? '#FF0000' : '#E9E9E9'};
  }

  ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: #959595;
  }
  
  :-ms-input-placeholder { /* Internet Explorer 10-11 */
    color: #959595;
  }
  
  ::-ms-input-placeholder { /* Microsoft Edge */
    color: #959595;
  }
`;

const ClearButton = styled.button`
  height: 1.75rem;
  width: 1.75rem;
  border-radius: 1rem;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: Relative Trial Bold;
  font-size: .875rem;
  background-color: #F5F5F5;
  transition: 
    transform 150ms ease;
  transform-origin: center center;
  z-index: 1;

  &:hover {
    background-color: #E9E9E9;
  }
`;

const Divider = styled.div`
  width: 100%;  
  border-bottom: 1px solid #E9E9E9;
`;

export default TopSection;
