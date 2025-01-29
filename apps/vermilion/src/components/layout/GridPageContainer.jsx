import styled from 'styled-components'

const ContainerBase = styled.div`
  width: calc(100% - 6rem);
  padding: 1.5rem 3rem 2.5rem 3rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;

  ${({ theme }) => theme.mediaQueries.md} {
    width: calc(100% - 3rem);
    padding: 1.5rem 1.5rem 2.5rem 1.5rem;
  }
`

export const Container = ({
  children,
  ...props
}) => (
  <ContainerBase
    {...props}
  >
    {children}
  </ContainerBase>
)
