import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { CheckIcon, ChevronUpDuoIcon, CopyIcon, QuestionIcon, SweepIcon } from '../components/common/Icon';
import theme from '../styles/theme';
import { copyText, formatAddress, formatTimestampMs, capitalizeFirstLetter } from '../utils';
import useStore from '../store/zustand';
import { NETWORKS } from '../wallet/networks';
import SweepModal from '../components/modals/SweepModal';

const History = () => {
  const [copied, setCopied] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState(null);
  const [boostHistory, setBoostHistory] = useState([]);
  const [displaySweepColumn, setDisplaySweepColumn] = useState(false);
  const [isSweepModalOpen, setIsSweepModalOpen] = useState(false);
  const [boostHistoryRow, setBoostHistoryRow] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false); 

  const wallet = useStore((state) => state.wallet);
  const setWallet = useStore((state) => state.setWallet);
  const authToken = useStore((state) => state.authToken);
  const setAuthToken = useStore((state) => state.setAuthToken);

  const handleCopyClick = (id, content) => {
    copyText(content);
    setCopiedRowId(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    setTimeout(() => setCopiedRowId(null), 2000); // Reset after 2 seconds
  };

  const fetchBoostHistory = async () => {
    let url = `/bun/social/full_boost_history/${wallet.ordinalsAddress}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    });
    if (!response.ok) {
      if (response.status===401) {
        console.log('Unauthorized. Please log in again.');
        setWallet(null);
        setAuthToken(null);
        setIsUnauthorized(true); // Set unauthorized state
      } else {
        console.error('Error fetching boost history:', response.statusText);
      }
      return;
    }
    setIsUnauthorized(false); // Reset unauthorized state if response is valid
    const data = await response.json();
    console.log('Boost history:', data);
    data.forEach((row) => {
      row.type = "Boost";
      if (row?.sweep_tx_status === 'pending') {
        row.status = 'Sweep Pending';
      } else if (row?.sweep_tx_status === 'confirmed') {
        row.status = 'Sweep Confirmed';
      } else if (row.commit_tx_status === 'confirmed' && ['scheduled', 'pending'].includes(row.reveal_tx_status)) {
        row.status = 'Reveal Pending';
      } else if (row.commit_tx_status === 'confirmed' && row.reveal_tx_status === 'not_found') {
        row.status = 'Reveal Dropped';
      } else if (row.commit_tx_status === 'confirmed' && row.reveal_tx_status === 'failed') {
        row.status = 'Reveal Failed';
      } else {
        row.status = capitalizeFirstLetter(row.reveal_tx_status);
      }
    });
    setBoostHistory(data);
    let displaySweepButton = data.some((row) => ['Reveal Pending', 'Reveal Failed', 'Reveal Dropped'].includes(row.status));
    let displaySweepTxid = data.some((row) => row.sweep_tx_id);
    setDisplaySweepColumn(displaySweepButton || displaySweepTxid);
  }

  const getMempoolTxUrl = (txid) => {
    if (!wallet) return `https://memepool.space/tx/${txid}`;
    let link = `https://memepool.space/${NETWORKS[wallet.network].mempool}tx/${txid}`;
    return link;
  };

  const handleSweep = async (boostHistoryRow) => {
    setIsSweepModalOpen(true);
    setBoostHistoryRow(boostHistoryRow);
  }

  useEffect(() => {
    if (wallet?.ordinalsAddress) {
      fetchBoostHistory();
    } else {
      setBoostHistory([]);
      setIsUnauthorized(true); // Set unauthorized state
    }
  }, [wallet]);

  return (
    <MainContainer>
      <LinkContainer>
        <PageText>Order History</PageText>
        <VerticalDivider />
        <ButtonContainer>
          <TabButton href={"https://discord.gg/a5EN38CfjU"} target="_blank" rel="noopener noreferrer">
            <QuestionIcon size={'1.25rem'} />
            Get Help
          </TabButton>
        </ButtonContainer>
      </LinkContainer>
      <Divider />
      {isUnauthorized ? (
        <UnauthorizedContainer>
          <UnauthorizedText>
            History unavailable.
            <UnauthorizedTextDetail> Connect your wallet to view your order history.</UnauthorizedTextDetail>
          </UnauthorizedText>
        </UnauthorizedContainer>
      ) : (
        <ScrollContainer>
          <TableContainer>
            <HeaderRow>
              <HeaderCell>ID</HeaderCell>
              <HeaderCell>Type</HeaderCell>
              <HeaderCell>Creation Date</HeaderCell>
              <HeaderCell>Quantity</HeaderCell>
              <HeaderCell>Status</HeaderCell>
              <HeaderCell>Commit TX</HeaderCell>
              <HeaderCell>Reveal TX</HeaderCell>
              {displaySweepColumn ? <HeaderCell>Sweep TX</HeaderCell> : <HeaderCell></HeaderCell>}
            </HeaderRow>
            {boostHistory.map((row, index) => (
              <DataRow key={index} isLastRow={index === boostHistory.length - 1}>
                <DataCell>
                  {formatAddress(row.boost_id)}
                  <CopyButton onClick={() => handleCopyClick(index, row.boost_id)} copied={copied}>
                    {copiedRowId === index ? <CheckIcon size={'1rem'} color={theme.colors.background.success} /> : <CopyIcon size={'1rem'} />}
                  </CopyButton>
                </DataCell>
                <DataCell>
                  <TypeTag>
                    <ChevronUpDuoIcon size={'1rem'} color={theme.colors.background.verm} />
                    {row.type}
                  </TypeTag>
                </DataCell>
                <DataCell>{formatTimestampMs(row.timestamp)}</DataCell>
                <DataCell>{row.boost_quantity}</DataCell>
                <DataCell>
                  <StatusDot status={row.status} />
                  {row.status}
                </DataCell>
                <DataCell>
                  <StyledLink href={getMempoolTxUrl(row.reveal_tx_id)} target="_blank">
                    {formatAddress(row.commit_tx_id)}
                  </StyledLink>
                </DataCell>
                <DataCell>
                  <StyledLink href={getMempoolTxUrl(row.reveal_tx_id)} target="_blank">
                    {formatAddress(row.reveal_tx_id)}
                  </StyledLink>
                </DataCell>
                <ActionCell>
                  {row.sweep_tx_id ? (
                    <StyledLink href={getMempoolTxUrl(row.sweep_tx_id)} target="_blank">
                      {formatAddress(row.sweep_tx_id)}
                    </StyledLink>
                  ) : ['Reveal Pending', 'Reveal Failed', 'Reveal Dropped'].includes(row.status) && (
                    <SweepButton onClick={() => handleSweep(row)}>
                      <SweepIcon size={'1.125rem'} />
                      Sweep
                    </SweepButton>
                  )}
                </ActionCell>
              </DataRow>
            ))}
          </TableContainer>
        </ScrollContainer>
      )}
      <SweepModal
        isOpen={isSweepModalOpen}
        onClose={() => {
          setIsSweepModalOpen(false);
          setBoostHistoryRow(null);
        }}
        boostHistoryRow={boostHistoryRow}
      />
    </MainContainer>    
  )
}

const MainContainer = styled.div`
  width: calc(100% - 6rem);
  padding: 1.5rem 3rem 2.5rem 3rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  transition: all 200ms ease;

  @media (max-width: 864px) {
    width: calc(100% - 2rem);
    padding: 1.5rem 1rem 2.5rem 1rem;
  }
`;

const LinkContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  gap: .75rem;
`;

const VerticalDivider = styled.div`
  height: 2rem;
  border-right: 1px solid ${theme.colors.border};
`;

const PageText = styled.p`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.5rem;
  line-height: 2rem;
  margin: 0;
`;

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid ${theme.colors.border};
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: .25rem;
`;

const TabButton = styled.a`
  border: none;
  padding: 0 .75rem;
  height: 2rem;
  border-radius: 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .25rem;
  cursor: pointer;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.tertiary}; 
  background-color: ${theme.colors.background.white}; 
  transition: all 200ms ease;
  transform-origin: center center;
  text-decoration: none;

  &:hover {
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.primary};

    svg {
      fill: ${theme.colors.text.primary};
    }
  }

  &:active {
    transform: scale(0.96);
  }

  svg {
    fill: ${theme.colors.text.tertiary};
    transition: fill 200ms ease;
  }
`;

const ScrollContainer = styled.div`
  position: relative;
  width: 100%;
  overflow-x: auto;
  
  /* Hide scrollbar for WebKit-based browsers (Chrome, Safari, Edge) */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for Firefox */
  scrollbar-width: none; /* Firefox */
`;

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  width: 100%;
  background-color: ${theme.colors.background.white};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.secondary};
  box-sizing: border-box;
  padding: 0.125rem 0.375rem;
`;

const HeaderCell = styled.div`
  flex: 1;
  min-width: 9.5rem;
  text-align: left;
  white-space: nowrap; // Prevent text from wrapping
  overflow: hidden; // Hide overflow text
  text-overflow: ellipsis; // Show ellipsis for overflow text
  // min-width: 0;
  flex: 1;
`;

const DataRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  height: 3.5rem;
  background-color: ${theme.colors.background.white};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.primary};
  box-sizing: border-box;
  padding: 0.75rem 0.375rem;
  border-bottom: ${(props) => (props.isLastRow ? 'none' : `1px solid ${theme.colors.background.primary}`)};
`;

const DataCell = styled.div`
  display: flex;
  align-items: center;
  min-width: 9.5rem;
  gap: 0.375rem;
  flex: 1;
  text-align: left;
  white-space: nowrap; // Prevent text from wrapping
  overflow: hidden; // Hide overflow text
  text-overflow: ellipsis; // Show ellipsis for overflow text
  // min-width: 0;
  flex: 1;
`;

const ActionCell = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const CopyButton = styled.button`
  border: none;
  margin: 0;
  padding: 0;
  height: 1rem;
  width: 1rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;
  background-color: ${theme.colors.background.white};
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 200ms ease;
  transform-origin: center center;

  svg {
    fill: ${theme.colors.text.tertiary};
    transition: all 200ms ease;
  }

  &:hover {
    svg {
      fill: ${theme.colors.text.primary};
    }
  }

  &:active {
    transform: scale(0.96);
  }
`;

const TypeTag = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  width: fit-content;
  background-color: ${theme.colors.background.vermPale};
  color: ${theme.colors.background.verm};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    background-color: ${theme.colors.background.vermBorder};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const StatusDot = styled.div`
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background-color: ${(props) => {
    if (props.status === 'Confirmed' || props.status === 'Sweep Confirmed') {
      return theme.colors.background.success;
    }
    if (props.status === 'Reveal Failed' || props.status === 'Reveal Dropped' || props.status === 'Reveal Pending') {
      // Partial failure, action required (orange)
      return '#FFA500';
    }
    if (props.status === 'Failed') {
      return '#D32F2F'; // Failed, no action required (red)
    }
    return '#FCDC35'; // Default pending/other state color (yellow)
  }};
`;

const StyledLink = styled.a`
  color: ${theme.colors.text.primary};
  text-decoration: underline;
  text-decoration-color: ${theme.colors.background.secondary};
  text-decoration-thickness: 0.125rem;
  text-underline-offset: 0.125rem;
  transition: all 200ms ease;

  &:hover {
    text-decoration-color: ${theme.colors.text.primary};
  }
`;

const SweepButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.primary};
  border: none;
  border-radius: 1rem;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }

  svg {
    fill: ${theme.colors.text.primary};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const UnauthorizedContainer = styled.div`
  background-color: #FEF0F0;
  box-sizing: border-box;
  padding: 0.75rem;
  border-radius: 0.25rem;
  width: 100%;
  display: flex;
  margin: 0;
`;

const UnauthorizedText = styled.span`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1rem;
  line-height: 1.5rem;
  color: #730F14;
  margin: 0;
  padding: 0;
`;

const UnauthorizedTextDetail = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: #730F14;
  margin: 0;
  padding: 0;
`;

export default History;
