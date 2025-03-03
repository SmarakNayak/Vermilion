import styled from 'styled-components';

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
`;

export const Page = ({ 
  children,
  ...props 
}) => (
  <PageWrapper {...props}>
    {children}
  </PageWrapper>
);
