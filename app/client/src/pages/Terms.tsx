import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import theme from '../styles/theme';

const Terms: React.FC = () => {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    fetch('/assets/verm_terms.md')
      .then(res => res.text())
      .then(text => setContent(text));
  }, []);

  const renderContent = () => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      if (!line) {
        i++;
        continue;
      }

      // First line is the main title
      if (i === 0 && line === 'Terms and Conditions') {
        elements.push(<PageTitle key={i}>{line}</PageTitle>);
        i++;
        continue;
      }

      // Last updated line
      if (line.startsWith('Last updated:')) {
        elements.push(<LastUpdated key={i}>{line}</LastUpdated>);
        i++;
        continue;
      }

      // Section headers
      const sectionHeaders = [
        'Interpretation and Definitions',
        'Acknowledgment',
        'Use of the Website',
        'Assumption of Risk and Liability',
        'Governing Law and Jurisdiction',
        'Inscription Service',
        'Links to Other Websites',
        'Termination',
        'Limitation of Liability',
        '"AS IS" and "AS AVAILABLE" Disclaimer',
        'Governing Law',
        'Disputes Resolution',
        'For European Union (EU) Users',
        'United States Legal Compliance',
        'Severability and Waiver',
        'Translation Interpretation',
        'Changes to These Terms and Conditions',
        'Contact Us',
      ];

      const subHeaders = [
        'Interpretation',
        'Definitions',
        'Severability',
        'Waiver',
      ];

      if (sectionHeaders.includes(line)) {
        elements.push(<SectionHeader key={i}>{line}</SectionHeader>);
        i++;
        continue;
      }

      if (subHeaders.includes(line)) {
        elements.push(<SubHeader key={i}>{line}</SubHeader>);
        i++;
        continue;
      }

      // Bullet points
      if (line.startsWith('-') || line.startsWith('•')) {
        const bulletText = line.replace(/^[-•]\s*/, '');
        elements.push(
          <BulletItem key={i}>
            <BulletDot />
            <BulletText>{bulletText}</BulletText>
          </BulletItem>
        );
        i++;
        continue;
      }

      // Regular paragraphs
      elements.push(<Paragraph key={i}>{line}</Paragraph>);
      i++;
    }

    return elements;
  };

  return (
    <MainContainer>
      <ContentContainer>
        {renderContent()}
      </ContentContainer>
    </MainContainer>
  );
};

const MainContainer = styled.div`
  width: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ContentContainer = styled.div`
  width: calc(100% - 2rem);
  max-width: 48rem;
  padding: 1.5rem 1rem 3rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const PageTitle = styled.h1`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 2rem;
  line-height: 2.5rem;
  color: ${theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
`;

const LastUpdated = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.secondary};
  margin: 0 0 1.5rem 0;
`;

const SectionHeader = styled.h2`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.5rem;
  line-height: 2rem;
  color: ${theme.colors.text.primary};
  margin: 2rem 0 1rem 0;
`;

const SubHeader = styled.h3`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.25rem;
  line-height: 1.75rem;
  color: ${theme.colors.text.primary};
  margin: 1.5rem 0 0.75rem 0;
`;

const Paragraph = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.625rem;
  color: ${theme.colors.text.primary};
  margin: 0 0 1rem 0;
`;

const BulletItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
`;

const BulletDot = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  min-width: 0.5rem;
  border-radius: 50%;
  background-color: ${theme.colors.primary};
  margin-top: 0.5rem;
`;

const BulletText = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.625rem;
  color: ${theme.colors.text.primary};
`;

export default Terms;
