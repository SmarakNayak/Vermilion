import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import FlexItem from './FlexItem';

const MasonryGrid = ({ similarInscriptions }) => {
  const [columnCount, setColumnCount] = useState(5);

  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth;
      if (width < 630) setColumnCount(2);
      else if (width < 960) setColumnCount(3);
      else if (width < 1346) setColumnCount(4);
      else if (width < 1600) setColumnCount(5);
      else if (width < 1984) setColumnCount(6);
      else setColumnCount(6);
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);

  const columns = Array.from({ length: columnCount }, () => []);

  similarInscriptions.forEach((item, index) => {
    const columnIndex = index % columnCount;
    columns[columnIndex].push(item);
  });

  return (
    <GridContainer>
      {columns.map((column, columnIndex) => (
        <ColumnContainer key={columnIndex} columnCount={columnCount}>
          {column.map(item => (
            <FlexItem key={item.id} number={item.number} />
          ))}
        </ColumnContainer>
      ))}
    </GridContainer>
  );
};

const GridContainer = styled.div`
  display: flex;
  gap: 2rem;
  width: 100%;
  overflow-x: hidden;

  @media (max-width: 864px) {
    gap: 1.5rem;
  }
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: ${props => `calc(${100 / props.columnCount}% - ${(props.columnCount - 1) * 2 / props.columnCount}rem)`};

  @media (max-width: 864px) {
    width: ${props => `calc(${100 / props.columnCount}% - ${(props.columnCount - 1.25) * 2 / props.columnCount}rem)`};
  }
`;

export default MasonryGrid;
