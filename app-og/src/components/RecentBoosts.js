import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const RecentBoosts = () => {
  const [recentBoosts, setRecentBoosts] = useState([]);
  const [boostContent, setBoostContent] = useState({});
  const [contentTypes, setContentTypes] = useState({});

  useEffect(() => {
    fetchRecentBoosts();
    const interval = setInterval(fetchRecentBoosts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchRecentBoosts = async () => {
    try {
      const response = await fetch('/api/recent_boosts?n=3');
      const data = await response.json();
      setRecentBoosts(data);
      
      // Fetch delegate content for each boost
      data.forEach(boost => {
        if (boost.delegate) {
          fetchDelegateContent(boost.delegate);
        }
      });
    } catch (error) {
      console.error('Error fetching recent boosts:', error);
    }
  };

  const fetchDelegateContent = async (delegateId) => {
    try {
      const response = await fetch(`/api/inscription_metadata/${delegateId}`);
      const metadata = await response.json();
      
      const contentResponse = await fetch(`/api/inscription_number/${metadata.number}`);
      const contentType = contentResponse.headers.get("content-type");
      
      setContentTypes(prev => ({
        ...prev,
        [delegateId]: contentType
      }));

      if (contentType.startsWith('image/')) {
        setBoostContent(prev => ({
          ...prev,
          [delegateId]: {
            url: `/api/inscription_number/${metadata.number}`,
            number: metadata.number
          }
        }));
      } else {
        // Handle other content types if needed
        console.log('Unsupported content type:', contentType);
      }
    } catch (error) {
      console.error('Error fetching delegate content:', error);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = Math.floor(Date.now() / 1000);
    const minutesAgo = Math.floor((now - timestamp) / 60);
    
    if (minutesAgo < 1) return 'just now';
    if (minutesAgo === 1) return '1m ago';
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo === 1) return '1h ago';
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    
    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo === 1) return '1d ago';
    return `${daysAgo}d ago`;
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 5)}...${address.slice(-5)}`;
  };

  return (
    <Container>
      {recentBoosts.map((boost, index) => (
        <BoostRow key={index}>
          <LeftSection>
            {boostContent[boost.delegate] && (
              <Link to={`/inscription/${boostContent[boost.delegate].number}`}>
                <InscriptionImage 
                  src={boostContent[boost.delegate].url} 
                  alt={`Inscription ${boostContent[boost.delegate].number}`}
                />
              </Link>
            )}
            <BoostText>
              Boosted by{' '}
              <AddressLink to={`/address/${boost.address}`}>
                {formatAddress(boost.address)}
              </AddressLink>
            </BoostText>
          </LeftSection>
          <TimeText>{getTimeAgo(boost.timestamp)}</TimeText>
        </BoostRow>
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: .75rem;
`;

const BoostRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: .375rem;
`;

const InscriptionImage = styled.img`
  width: 2.5rem;
  height: 2.5rem;
  image-rendering: pixelated;
  border-radius: .125rem;
  border: 1px #E9E9E9 solid;
  object-fit: cover;
`;

const BoostText = styled.span`
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #959595;
`;

const AddressLink = styled(Link)`
  color: #000000;
  text-decoration: none;
  font-family: Relative Trial Medium;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TimeText = styled.span`
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #959595;
`;

export default RecentBoosts;