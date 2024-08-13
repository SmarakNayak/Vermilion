import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from "react-router-dom";
import { addCommas } from '../helpers/utils';

const FlexItem = ({ number }) => {
  const [contentType, setContentType] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      setContentType("loading");
      const response = await fetch("/api/inscription_number/"+number);
      let content_type = response.headers.get("content-type");
      if (content_type.startsWith("image/")) {
        setContentType("image");
      } else {
        setContentType("unsupported");
      }
    }

    fetchContent();
  }, [number]);

  return (
    <FlexItemContainer>
      <UnstyledLink to={'/inscription/' + number}>
        <MediaContainer>
          {contentType === "image" && (
            <>
              <ImageContainer 
                src={`/api/inscription_number/${number}`} 
                alt={`Inscription ${number}`}
              />
              <Overlay>
                <InscriptionNumber>{addCommas(number)}</InscriptionNumber>
              </Overlay>
            </>
          )}
          {contentType === "loading" && <LoadingPlaceholder />}
          {contentType === "unsupported" && <UnsupportedPlaceholder />}
        </MediaContainer>
      </UnstyledLink>
    </FlexItemContainer>
  );
}

const FlexItemContainer = styled.div`
  width: 100%;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
  display: block;
`;

const MediaContainer = styled.div`
  width: 100%;
  background-color: #F5F5F5;
  overflow: hidden;
  position: relative;
`;

const ImageContainer = styled.img`
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;

  ${MediaContainer}:hover & {
    opacity: 1;
  }
`;

const InscriptionNumber = styled.span`
  font-family: Relative Trial Medium;
  color: #FFF;
  font-size: 1rem;
  background-color: rgba(46,42,37,.6);
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
`;

const LoadingPlaceholder = styled.div`
  width: 100%;
  padding-top: 100%;
  background-color: #E0E0E0;
`;

const UnsupportedPlaceholder = styled.div`
  width: 100%;
  padding-top: 100%;
  background-color: #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Relative Trial Medium;
  font-size: .75rem;
  color: #959595;
`;

export default FlexItem;