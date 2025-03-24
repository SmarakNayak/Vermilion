import React from 'react';
import styled from 'styled-components';
import InscriptionIcon from '../InscriptionIcon';
import { theme } from '../../styles/theme';
import MainText from '../common/text/MainText';
import InfoText from '../common/text/InfoText';
import UnstyledLink from '../common/UnstyledLink';
import IconButton from '../common/buttons/IconButton';
import {  TwitterIcon, DiscordIcon, WebIcon } from '../common/Icon';
import Stack from '../Stack';
import { 
  HeaderContainer,
  MainContentStack,
  CollectionStack,
  SocialStack,
  CollectionImageContainer,
} from './Layout';
import { shortenDate } from '../../utils/format';

const GridPageHeader = ({ collectionSummary }) => {
  const hasSocialLinks = collectionSummary?.twitter || collectionSummary?.discord || collectionSummary?.website;

  return (
    <HeaderContainer>
      <MainContentStack>
        <InfoText>Collection</InfoText>
        <CollectionStack>
          <CollectionImageContainer>
            {collectionSummary?.range_start && (
              <InscriptionIcon endpoint={`/api/inscription_number/${collectionSummary?.range_start}`} useBlockIconDefault={false} size={'8rem'} />
            )}
          </CollectionImageContainer>
          <Stack gap={'.5rem'}>
            <MainText>{collectionSummary?.name}</MainText>
            <InfoText>Created {collectionSummary?.first_inscribed_date ? shortenDate(collectionSummary.first_inscribed_date) : ""}</InfoText>
          </Stack>
        </CollectionStack>
      </MainContentStack>
      {hasSocialLinks && (
        <SocialStack>
          {collectionSummary?.twitter && (
            <UnstyledLink to={collectionSummary.twitter} target='_blank'>
              <IconButton>
                <TwitterIcon size={'1.25rem'} color={theme.colors.text.primary} />
              </IconButton>
            </UnstyledLink>
          )}
          {collectionSummary?.discord && (
            <UnstyledLink to={collectionSummary.discord} target='_blank'>
              <IconButton>
                <DiscordIcon size={'1.25rem'} color={theme.colors.text.primary} />
              </IconButton>
            </UnstyledLink>
          )}
          {collectionSummary?.website && (
            <UnstyledLink to={collectionSummary.website} target='_blank'>
              <IconButton>
                <WebIcon size={'1.25rem'} color={theme.colors.text.primary} />
              </IconButton>
            </UnstyledLink>
          )}
        </SocialStack>
      )}
    </HeaderContainer>
  );
};

// const Stack = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: ${props => props.gap || '0'};
// `;

export default GridPageHeader;
