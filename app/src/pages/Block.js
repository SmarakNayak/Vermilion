import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';


const Block = () => {
    let { number } = useParams();
  
    useEffect(() => {
  
      const fetchContent = async () => {
        //1. Get inscription numbers
        const response = await fetch("/api/inscriptions_in_block/" + number);

      }
    },[number])
  
    return (
      <PageContainer>
        <h1>Block {number}</h1>

      </PageContainer>
      
    )
  }
  
  const PageContainer = styled.div`
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    flex: 1;
    align-items: center;
    justify-content: center;
    position: relative;
  
    @media (max-width: 768px) {
      padding: 0 2rem;
    }
  `;
  
  export default Block;