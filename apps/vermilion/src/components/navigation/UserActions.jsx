import styled from 'styled-components';

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ConnectButton = styled.button`
  height: 2.5rem;
  padding: 0 1rem;
  border: none;
  border-radius: 1.5rem;
  background-color: ${({theme}) => `${theme.colors.background.dark}`};
  color: ${({theme}) => `${theme.colors.text.white}`};
  font-family: relative-bold-pro;
  font-size: 1rem;
  cursor: pointer;
  transition: all 200ms ease;

  @media (max-width: 630px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border: none;
  border-radius: 1.5rem;
  background-color: #F5F5F5;
  cursor: pointer;
  transition: background-color 350ms ease;

  &:hover {
    background-color: #E9E9E9;
  }

  @media (max-width: 630px) {
    display: flex;
  }
`;

const UserActions = () => {
  return (
    <ActionsContainer>
      <ConnectButton>Connect</ConnectButton>
      <MobileMenuButton>
        {/* Add menu icon here */}
      </MobileMenuButton>
    </ActionsContainer>
  );
};

export default UserActions;
