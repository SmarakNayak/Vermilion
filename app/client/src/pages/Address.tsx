import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import styled from 'styled-components';
import { theme } from '../styles/theme';

// import components
import PageContainer from '../components/layout/PageContainer';
import {
  HeaderContainer,
  MainContentStack,
  DetailsStack,
  SocialStack,
  RowContainer,
  GalleryContainer,
  ProfileContainer,
  HorizontalTabContainer,
  TabText
} from '../components/grid/Layout';
import GridControls from '../components/grid/GridControls';
import { GridHeaderSkeleton } from '../components/grid/GridHeaderSkeleton';
import MainText from '../components/common/text/MainText';
import InfoText from '../components/common/text/InfoText';
import Tooltip from '../components/common/Tooltip';
import UnstyledLink from '../components/common/UnstyledLink';
import IconButton from '../components/common/buttons/IconButton';
import Stack from '../components/Stack';
import FilterMenu from '../components/FilterMenu';
import GalleryInfiniteScroll from '../components/GalleryInfiniteScroll';
import { FolderInfiniteScroll } from '../components/FolderInfiniteScroll';

// import icons
import { CopyIcon, CheckIcon, WalletIcon, TwitterIcon, DiscordIcon, WebIcon } from '../components/common/Icon';

// import utils
import { formatAddress } from '../utils/format';
import { copyText } from '../utils/clipboard';

import { useAtomValue } from '@effect-atom/atom-react';
import { profileAtomFamily } from '../atoms/familyAtomics';
import { Option, pipe } from 'effect';
import { Result } from '@effect-atom/atom-react';

const Address = () => {
  const [baseApi, setBaseApi] = useState<any|null>(null); 
  let { address } = useParams();
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState(false);
  const [zoomGrid, setZoomGrid] = useState(true);
  const [activeTab, setActiveTab] = useState('inscriptions');
  const [copied, setCopied] = useState(false);

  const [selectedSortOption, setSelectedSortOption] = useState('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": ["text", "image", "gif", "audio", "video", "html"], "Satributes": [], "Charms":[]});

  const profileResult = useAtomValue(profileAtomFamily(address));
  // Extract profile data from Result<Option<Profile>>
  const profileOption = pipe(  
    Result.value(profileResult), // Returns Option<Option<Profile>>
    Option.flatten // Flattens to Option<Profile>
  );

  //1. get endpoint
  useEffect(() => {
    let query_string = "/api/inscriptions_in_address/" + address + "?sort_by=" + selectedSortOption;
    if (selectedFilterOptions["Content Type"] !== undefined && selectedFilterOptions["Content Type"].length > 0) {
      query_string += "&content_types=" + selectedFilterOptions["Content Type"].toString();
    }
    if (selectedFilterOptions["Satributes"] !== undefined && selectedFilterOptions["Satributes"].length > 0) {
      query_string += "&satributes=" + selectedFilterOptions["Satributes"].toString();
    }
    if (selectedFilterOptions["Charms"] !== undefined && selectedFilterOptions["Charms"].length > 0) {
      query_string += "&charms=" + selectedFilterOptions["Charms"].toString();
    }
    setBaseApi(query_string);
  },[address, selectedSortOption, selectedFilterOptions]);

  // function to toggle visibility of inscription numbers
  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  const toggleFilterVisibility = () => {
    setFilterVisibility(!filterVisibility);
  };

  const toggleGridType = () => {
    setZoomGrid(!zoomGrid);
  };

  const handleSortOptionChange = (option: any) => {
    setSelectedSortOption(option);
  };

  const handleFilterOptionsChange = (filterOptions: any) => {
    setSelectedFilterOptions(filterOptions);
  };

  const handleCopyClick = () => {
    copyText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let hasSocialLinks = false;
  if(Option.isSome(profileOption)) {
    const profile = profileOption.value;
    if (Option.isSome(profile.user_twitter) || Option.isSome(profile.user_discord) || Option.isSome(profile.user_website)) {
      hasSocialLinks = true;
    }
  }

  return (
    <PageContainer>
      {profileResult._tag === 'Initial' ? (
        <GridHeaderSkeleton 
          pageType={'Address'} 
          isProfile={true}
          removeInfoText={true}
          hasDescription={false} 
          numTags={0}
          removeTags={true}
        />
      ) : (
        <>
          <HeaderContainer>
            <MainContentStack>
              <InfoText>{Option.isSome(profileOption) ? 'Profile' : 'Address'}</InfoText>
              <DetailsStack>
                <ProfileContainer>
                  {Option.isSome(profileOption) && Option.isSome(profileOption.value.user_picture) && profileOption.value.user_picture.value !=='' ? (
                    <ProfilePicture src={`/content/${profileOption.value.user_picture.value}`} alt="Profile" />
                  ) : (
                    <WalletIcon size={'2rem'} color={theme.colors.background.verm}></WalletIcon>
                  )}
                </ProfileContainer>
                <Stack gap={'.5rem'}>
                  <MainText>
                    {profileOption.pipe(
                      Option.map((profile) => profile.user_name),
                      Option.getOrElse(() => formatAddress(address))
                    )}
                  </MainText>
                  <AddressRow>
                    <InfoText>{formatAddress(address)}</InfoText>
                    <CopyButton onClick={handleCopyClick} copied={copied}>
                      {copied ? <CheckIcon size={'1.125rem'} /> : <CopyIcon size={'1.125rem'} />}
                    </CopyButton>
                  </AddressRow>
                </Stack>
              </DetailsStack>
            </MainContentStack>
            {hasSocialLinks && (
              <SocialStack>
                {Option.isSome(profileOption) && Option.isSome(profileOption.value.user_twitter) && profileOption.value.user_twitter.value !=='' && (
                  <Tooltip content={"Twitter"}>
                    <ButtonWrapper>
                      <UnstyledLink to={`https://twitter.com/${profileOption.value.user_twitter.value}`} target='_blank'>
                        <IconButton>
                          <TwitterIcon size={'1.25rem'} color={theme.colors.text.primary} />
                        </IconButton>
                      </UnstyledLink>
                    </ButtonWrapper>
                  </Tooltip>
                )}
                {Option.isSome(profileOption) && Option.isSome(profileOption.value.user_discord) && profileOption.value.user_discord.value !==''  && (
                  <Tooltip content={"Discord"}>
                    <ButtonWrapper>
                      <UnstyledLink to={`https://discord.com/users/${profileOption.value.user_discord.value}`} target='_blank'>
                        <IconButton>
                          <DiscordIcon size={'1.25rem'} color={theme.colors.text.primary} />
                        </IconButton>
                      </UnstyledLink>
                    </ButtonWrapper>
                  </Tooltip>
                )}
                {Option.isSome(profileOption) && Option.isSome(profileOption.value.user_website) && profileOption.value.user_website.value !=='' && (
                  <Tooltip content={"Website"}>
                    <ButtonWrapper>
                      <UnstyledLink to={profileOption.value.user_website.value} target='_blank'>
                        <IconButton>
                          <WebIcon size={'1.25rem'} color={theme.colors.text.primary} />
                        </IconButton>
                      </UnstyledLink>
                    </ButtonWrapper>
                  </Tooltip>
                )}
              </SocialStack>
            )}
          </HeaderContainer>
          {Option.isSome(profileOption) && Option.isSome(profileOption.value.user_bio) && profileOption.value.user_bio.value !=='' && (
            <RowContainer>
              <InfoText islarge={true}>{profileOption.value.user_bio.value}</InfoText>
            </RowContainer>
          )}
        </>
      )}
      <HorizontalTabContainer>
        <TabText 
          isActive={activeTab === 'inscriptions'}
          onClick={() => setActiveTab('inscriptions')}
        >
          Inscriptions
        </TabText>
        <TabText 
          isActive={activeTab === 'bookmarks'}
          onClick={() => setActiveTab('bookmarks')}
        >
          Bookmarks
        </TabText>
      </HorizontalTabContainer>
      {/* Display:contents is effectively a no-op in terms of layout,
          it's a truly empty div that does not effect the layout at all,
          it allows the children to be rendered without creating a new block formatting context.
          Altering display to none does not rerender (and thus trigger new network requests) on tab switch
          This is a much better than conditionally rendering the entire component
          i.e. { activeTab === 'inscriptions' ? <InscriptionsComponent /> : <BookmarksComponent />}
          Longer term we would want to refactor this to use effect-atom/react-query to cache the data fetching
       */}
      <div style={{ display: activeTab === 'inscriptions' ? 'contents' : 'none' }}>
        <GridControls 
          filterVisibility={filterVisibility} 
          toggleFilterVisibility={toggleFilterVisibility} 
          numberVisibility={numberVisibility} 
          toggleNumberVisibility={toggleNumberVisibility} 
          zoomGrid={zoomGrid} 
          toggleGridType={toggleGridType} 
          handleSortOptionChange={handleSortOptionChange} 
          handleFilterOptionsChange={handleFilterOptionsChange} 
          selectedFilterOptions={selectedFilterOptions}
          filtersEnabled={true}
          initialOption={'newest'}
          includeRelevance={false}
          setZoomGrid={false}
        />
        <RowContainer>
          <FilterMenu isOpen={filterVisibility} onSelectionChange ={handleFilterOptionsChange} onClose={toggleFilterVisibility} initialSelection={selectedFilterOptions}></FilterMenu>
          <GalleryContainer>
            <GalleryInfiniteScroll baseApi={baseApi} numberVisibility={numberVisibility} zoomGrid={zoomGrid} isCollectionPage={false} />
          </GalleryContainer>
        </RowContainer>
      </div>
      <div style={{ display: activeTab === 'bookmarks' ? 'contents' : 'none' }}>
        <FolderInfiniteScroll address={address} />
      </div>
    </PageContainer>
  )
}

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
`;

const ProfilePicture = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const AddressRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
`;

const CopyButton = styled.button<{ copied: boolean }>`
  border: none;
  margin: 0;
  padding: 0;
  height: 1.25rem;
  width: 1.25rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;
  background-color: ${theme.colors.background.white};
  border-radius: 0.6125rem;
  cursor: pointer;
  transition: all 200ms ease;
  transform-origin: center center;

  svg {
    fill: ${(props) => (props.copied ? theme.colors.background.success : theme.colors.text.tertiary)};
    transition: all 200ms ease;
  }

  &:hover {
    svg {
      fill: ${(props) => (props.copied ? theme.colors.background.success : theme.colors.text.primary)};
    }
  }

  &:active {
    transform: scale(0.96);
  }
`;

export default Address;
