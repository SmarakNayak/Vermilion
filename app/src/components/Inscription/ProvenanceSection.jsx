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
            <ElementsRow>
              {parentsData.map((parent, index) => (
                <ParentInscriptionContainer key={`parent-${index}`}>
                  <PreviewContainer>
                    <InscriptionIcon
                      endpoint={`/bun/rendered_content_number/${parent.metadata.number}`}
                      useBlockIconDefault={false}
                      size={'3rem'}
                    />
                  </PreviewContainer>
                  <LinkTag 
                    hideIcon={true} 
                    link={`/inscription/${parent.metadata.number}`} 
                    value={addCommas(parent.metadata.number)} 
                    category={parent.metadata.content_category} 
                  />
                </ParentInscriptionContainer>
              ))}
            </ElementsRow>
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
          <ElementsRow>
            {recursiveSubmodulesData.map((submodule, index) => (
              <LinkTag 
                key={`submodule-${index}`} 
                hideIcon={true} 
                link={`/inscription/${submodule.metadata.number}`} 
                value={addCommas(submodule.metadata.number)} 
                category={submodule.metadata.content_category} 
              />
            ))}
          </ElementsRow>
        </SubSection>
      )}
      
      {/* Child Inscriptions */}
      {childrenInscriptions?.length > 0 && (
        <SubSection>
          <SubSectionHeader>
            <Stack horizontal center gap={'.5rem'}>
              <HeaderText>Child Inscriptions</HeaderText>
            </Stack>
            {childrenInscriptions.length > 0 && (
              <UnstyledLink to={`/children/${metadata.id}`}>
                <ViewAllButton>View all</ViewAllButton>
              </UnstyledLink>
            )}
          </SubSectionHeader>
          <ElementsRow>
            <InscriptionTags data={childrenInscriptions} />
          </ElementsRow>
        </SubSection>
      )}
      
      {/* Referenced By */}
      {referencedByData?.length > 0 && (
        <SubSection>
          <SubSectionHeader>
            <Stack horizontal center gap={'.5rem'}>
              <HeaderText>Referenced By</HeaderText>
            </Stack>
            {referencedByData.length > 0 && (
              <UnstyledLink to={`/references/${number}`}>
                <ViewAllButton>View all</ViewAllButton>
              </UnstyledLink>
            )}
          </SubSectionHeader>
          <ElementsRow>
            <InscriptionTags data={referencedByData} />
          </ElementsRow>
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
          <ElementsRow>
            {delegateData?.metadata.number && (
              <LinkTag 
                hideIcon={true} 
                link={`/inscription/${delegateData.metadata.number}`} 
                value={addCommas(delegateData.metadata.number)} 
                category={delegateData.metadata.content_category} 
              />
            )}
          </ElementsRow>
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
              <ViewAllButton>View all</ViewAllButton>
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
  color: ${theme.colors.text.primary};
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

const ViewAllButton = styled.p`
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
  color: ${theme.colors.text.secondary};
`;

const ParentInscriptionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
`;

const PreviewContainer = styled.div`
  width: 3rem;
  height: 3rem;
  overflow: hidden;
  border-radius: 0.25rem;
  background-color: ${theme.colors.background.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default ProvenanceSection;
