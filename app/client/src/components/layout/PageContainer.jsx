import styled from 'styled-components';

const PageContainer = styled.div`
  width: calc(100% - 6rem);
  padding: 1.5rem 3rem 2.5rem 3rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all 200ms ease;

  @media (max-width: 864px) {
    width: calc(100% - 2rem);
    padding: 1.5rem 1rem 2.5rem 1rem;
  }
`;

export default PageContainer;
