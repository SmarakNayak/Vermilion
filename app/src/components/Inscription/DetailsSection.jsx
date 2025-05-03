import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { CheckIcon, CopyIcon } from '../common/Icon';
import { addCommas, formatAddress } from '../../utils/format';
import InfoText from '../common/text/InfoText';
import theme from '../../styles/theme';

const DetailsSection = ({ metadata, shortId, prettySize, address, shortAddress, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const [validAddress, setValidAddress] = useState(false);

  const handleCopyClick = (id) => {
    onCopy(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  if (!metadata) return null;

  // Check for address
  const checkAddress = (address) => {
    if (address && address !== "unbound" && address !== "Failed to convert script to address: script is not a p2pkh, p2sh or witness program") {
      setValidAddress(true);
    } else {
      setValidAddress(false);
    }
  }

  useEffect(() => {
    checkAddress(address?.address);
  }
  , [address]);
  
  return (
    <DataContainer>
      <InfoRow>
        <InfoLabel>Owner</InfoLabel>
        <InfoData>
          {validAddress ? (
            <UnstyledLink to={`/address/${address?.address}`}>
              <LinkText>{shortAddress}</LinkText>
            </UnstyledLink>
          ) : (
            <InfoText ismain>{formatAddress(address.address)}</InfoText>
          )}
          {/* <UnstyledLink to={address?.address !== "unbound" ? `/address/${address?.address}` : ""}>
            <LinkText>{address?.address ? formatAddress(address.address) : ""}</LinkText>
          </UnstyledLink> */}
        </InfoData>
      </InfoRow>
      
      <InfoRow isMiddle>
        <InfoLabel>Inscription ID</InfoLabel>
        <InfoData>
          <InfoText ismain>{metadata?.id ? shortId : ""}</InfoText>
          <CopyButton onClick={() => handleCopyClick(metadata?.id)} copied={copied}>
            {copied ? <CheckIcon size={'1.125rem'} /> : <CopyIcon size={'1.125rem'} />}
          </CopyButton>
        </InfoData>
      </InfoRow>
      
      <InfoRow isMiddle>
        <InfoLabel>File Type</InfoLabel>
        <InfoData>
          <InfoText ismain>{metadata?.content_type || ""}</InfoText>
        </InfoData>
      </InfoRow>
      
      <InfoRow isMiddle>
        <InfoLabel>File Size</InfoLabel>
        <InfoData>
          <InfoText ismain>{metadata?.content_length ? prettySize : ""}</InfoText>
        </InfoData>
      </InfoRow>
      
      <InfoRow isMiddle>
        <InfoLabel>Block Time</InfoLabel>
        <InfoData>
          <UnstyledLink to={`/block/${metadata?.genesis_height}`}>
            <LinkText>{metadata?.genesis_height ? addCommas(metadata?.genesis_height) : ""}</LinkText>
          </UnstyledLink>
        </InfoData>
      </InfoRow>
      
      <InfoRow isMiddle>
        <InfoLabel>Clock Time</InfoLabel>
        <InfoData>
          <InfoText ismain>
            {metadata?.timestamp 
              ? new Date(metadata?.timestamp*1000).toLocaleString(undefined, {
                  day: "numeric", 
                  month: "short", 
                  year: "numeric", 
                  hour: 'numeric', 
                  minute: 'numeric', 
                  hour12: true
                }) 
              : ""}
          </InfoText>
        </InfoData>
      </InfoRow>
      
      <InfoRow isMiddle>
        <InfoLabel>Fee</InfoLabel>
        <InfoData>
          <InfoText ismain>{metadata?.genesis_fee ? `${addCommas(metadata?.genesis_fee)} sats` : ""}</InfoText>
        </InfoData>
      </InfoRow>
      
      <InfoRow isMiddle>
        <InfoLabel>Sat Number</InfoLabel>
        <InfoData>
          <UnstyledLink to={`/sat/${metadata?.sat}`}>
            <LinkText>{metadata?.sat ? addCommas(metadata?.sat) : ""}</LinkText>
          </UnstyledLink>
        </InfoData>
      </InfoRow>
    </DataContainer>
  );
};

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  width: 100%;
  gap: .5rem;
  padding: .75rem 0;
  border-top: ${(props) => props.isMiddle ? `1px solid ${theme.colors.border}` : 'none'};
`;

const InfoLabel = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  color: ${theme.colors.text.secondary};
`;

const InfoData = styled.div`
  display: flex;
  flex: none;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: .5rem;
`;

const LinkText = styled(InfoText)`
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

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

const CopyButton = styled.button`
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

export default DetailsSection;
