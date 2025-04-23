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
  console.log('parents', parentsData);
  console.log('children', childrenInscriptions);
  console.log('referenced by', referencedByData);
  console.log('delegate', delegateData);
  console.log('recursive submodules', recursiveSubmodulesData);
  return (
    <Container>
      {/* Parent Inscriptions */}
      {metadata?.parents?.length > 0 && (
        <SubSection>
          <SubSectionHeader>
            <Stack horizontal center gap={'.5rem'}>
              <HeaderText>Parent Inscriptions</HeaderText>
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
            <Stack horizontal center gap={'.5rem'}>
              <HeaderText>Recursive Submodules</HeaderText>
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
            <Stack horizontal center gap={'.5rem'}>
              <HeaderText>Child Inscriptions</HeaderText>
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
            <Stack horizontal center gap={'.5rem'}>
              <HeaderText>Referenced By</HeaderText>
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
      
      {/* Editions */}
      {editionNumber != null && editionCount != null && metadata?.delegate == null && (
        <SubSection>
          <SubSectionHeader>
            <Stack horizontal center gap={'.5rem'}>
              <HeaderText>Editions</HeaderText>
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

export default ProvenanceSection;
