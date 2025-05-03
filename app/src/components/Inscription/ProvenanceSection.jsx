import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Stack from '../Stack';
import LinkTag from '../LinkTag';
import InscriptionTags from './InscriptionTags';
import { addCommas } from '../../utils/format';
import theme from '../../styles/theme';
import { BorderedTagSection } from './Layout';
import InscriptionIcon from '../InscriptionIcon';
import InscriptionPreviewItem from './InscriptionPreviewItem';
import Tooltip from '../common/Tooltip';
import { InfoCircleIcon } from '../common/Icon';

const ProvenanceSection = ({
  metadata,
  number,
  parentsData,
  recursiveSubmodulesData,
  childrenInscriptions,
  referencedByData,
  delegateData,
  editionNumber,
  editionCount
}) => {
  if (!metadata) return null;
  // console.log('parents', parentsData);
  // console.log('children', childrenInscriptions);
  // console.log('referenced by', referencedByData);
  // console.log('delegate', delegateData);
  // console.log('recursive submodules', recursiveSubmodulesData);
  return (
    <Container>
      {/* Delegate */}
      {metadata?.delegate && (
        <SubSection>
          <SubSectionHeader>
            <Stack horizontal center gap={'.5rem'}>
              <HeaderText>Delegate</HeaderText>
            </Stack>
          </SubSectionHeader>
          <BorderedTagSection>
            <PreviewRow>
              <InscriptionPreviewItem 
                inscriptionNumber={delegateData?.metadata.number}
                contentCategory={delegateData?.metadata.content_category}
                size="half"
                linkTo="inscription"
              />
            </PreviewRow>
          </BorderedTagSection>
        </SubSection>
      )}

      {/* Parent Inscriptions */}
      {metadata?.parents?.length > 0 && (
        <SubSection>
          <SubSectionHeader>
            <Stack horizontal center gap={'.5rem'}>
              <HeaderText>Parent Inscriptions</HeaderText>
              <Tooltip content={'Inscriptions that were provably owned by the inscriber and used to establish provenance at time of inscription.'}>
                <IconWrapper>
                  <InfoCircleIcon size="1.125rem" color={theme.colors.text.tertiary} />
                </IconWrapper>
              </Tooltip>
            </Stack>
          </SubSectionHeader>
          <BorderedTagSection>
            <PreviewRow>
              {parentsData.map((parent, index) => (
                <InscriptionPreviewItem 
                  key={`parent-${index}`}
                  inscriptionNumber={parent.metadata.number}
                  contentCategory={parent.metadata.content_category}
                  size="half"
                  linkTo="inscription"
                />
              ))}
            </PreviewRow>
          </BorderedTagSection>
        </SubSection>
      )}
      
      {/* Recursive Submodules */}
      {metadata?.referenced_ids?.length > 0 && (
        <SubSection>
          <SubSectionHeader>
            <Stack horizontal center gap={'.375rem'}>
              <HeaderText>Sources</HeaderText>
              <Tooltip content={'Inscriptions whose content is referenced by this inscription via recursion.'}>
                <IconWrapper>
                  <InfoCircleIcon size="1.125rem" color={theme.colors.text.tertiary} />
                </IconWrapper>
              </Tooltip>
            </Stack>
          </SubSectionHeader>
          <BorderedTagSection>
            <PreviewRow>
              {recursiveSubmodulesData.map((submodule, index) => (
                <InscriptionPreviewItem 
                  key={`submodule-${index}`}
                  inscriptionNumber={submodule.metadata.number}
                  contentCategory={submodule.metadata.content_category}
                  size="half"
                  linkTo="inscription"
                />
              ))}
            </PreviewRow>
          </BorderedTagSection>
        </SubSection>
      )}
      
      {/* Child Inscriptions */}
      {childrenInscriptions?.length > 0 && (
        <SubSection>
          <SubSectionHeader>
            <Stack horizontal center gap={'.375rem'}>
              <HeaderText>Child Inscriptions</HeaderText>
              <Tooltip content={'Inscriptions provably created by the owner of this parent inscription at time of inscription.'}>
                <IconWrapper>
                  <InfoCircleIcon size="1.125rem" color={theme.colors.text.tertiary} />
                </IconWrapper>
              </Tooltip>
            </Stack>
            <UnstyledLink to={`/children/${metadata.id}`}>
              <LinkText>View all</LinkText>
            </UnstyledLink>
          </SubSectionHeader>
          <BorderedTagSection>
            <PreviewRow>
              {childrenInscriptions.slice(0, 6).map((child, index) => (
                <InscriptionPreviewItem 
                  key={`child-${index}`}
                  inscriptionNumber={child.number}
                  contentCategory={child.content_category}
                  size="half"
                  linkTo="inscription"
                />
              ))}
            </PreviewRow>
          </BorderedTagSection>
          {/* <ElementsRow>
            <InscriptionTags data={childrenInscriptions} />
          </ElementsRow> */}
        </SubSection>
      )}
      
      {/* Referenced By */}
      {referencedByData?.length > 0 && (
        <SubSection>
          <SubSectionHeader>
            <Stack horizontal center gap={'.375rem'}>
              <HeaderText>Attributions</HeaderText>
              <Tooltip content={'Inscriptions that reference or build upon this inscription.'}>
                <IconWrapper>
                  <InfoCircleIcon size="1.125rem" color={theme.colors.text.tertiary} />
                </IconWrapper>
              </Tooltip>
            </Stack>
            <UnstyledLink to={`/references/${number}`}>
              <LinkText>View all</LinkText>
            </UnstyledLink>
          </SubSectionHeader>
          <BorderedTagSection>
            <PreviewRow>
              {referencedByData.slice(0, 6).map((reference, index) => (
                <InscriptionPreviewItem 
                  key={`reference-${index}`}
                  inscriptionNumber={reference.number}
                  contentCategory={reference.content_category}
                  size="half"
                  linkTo="inscription"
                />
              ))}
            </PreviewRow>
          </BorderedTagSection>
        </SubSection>
      )}
      
      {/* Editions */}
      {editionNumber != null && editionCount != null && metadata?.delegate == null && (
        <SubSection>
          <SubSectionHeader>
            <Stack horizontal center gap={'.375rem'}>
              <HeaderText>Editions</HeaderText>
              <Tooltip content={'Inscriptions that share identical content are known as editions. Their edition number reflects their order of inscription.'}>
                <IconWrapper>
                  <InfoCircleIcon size="1.125rem" color={theme.colors.text.tertiary} />
                </IconWrapper>
              </Tooltip>
              <CountBadge>
                {editionNumber} of {editionCount}
              </CountBadge>
            </Stack>
            <UnstyledLink to={`/edition/${metadata?.sha256}`}>
              <LinkText>View all</LinkText>
            </UnstyledLink>
          </SubSectionHeader>
        </SubSection>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SubSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: .75rem;
`;

const SubSectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const HeaderText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  color: ${theme.colors.text.secondary};
  font-size: .875rem;
  line-height: 1.25rem;
  margin: 0;
  padding: 0;
`;

const ElementsRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: .5rem;
  width: 100%;
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

const LinkText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  border: none;
  margin: 0;
  padding: 0;
  color: ${theme.colors.text.primary};
  text-decoration-line: underline;
  text-decoration-color: ${theme.colors.background.secondary};
  text-decoration-thickness: 0.125rem;
  text-underline-offset: 0.125rem;
  transition: all 200ms ease;

  &:hover {
    text-decoration-color: ${theme.colors.text.primary};
  }
`;

const CountBadge = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.background.primary};
  padding: .125rem .375rem;
  border-radius: .25rem;
  box-sizing: border-box;
  min-width: 1.375rem;
  height: 1.375rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  color: ${theme.colors.text.primary};
`;

const PreviewRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: .75rem;
  width: 100%;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
`;

export default ProvenanceSection;
