import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useModal } from '../../../hooks/useModal';
import { LoginIcon, AvatarPlusIcon } from '../Icon';
import theme from '../../../styles/theme';
import WalletConnectMenu from '../../navigation/WalletConnectMenu';
import { ModalOverlay } from '../../modals/common/ModalComponents';
import { SaveButton } from './SaveButton';
import { ProfileCreationModal } from '../../modals/ProfileCreationModal';

/**
 * A button component that guards actions behind authentication and profile creation
 * Shows appropriate messaging and actions based on auth state
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The actual save button to render when authenticated
 * @param {string} props.actionLabel - What action the user is trying to perform (e.g., "create a folder")
 */
const AuthGuardSaveButton = ({ children, actionLabel = "use this feature" } :{
  children: React.ReactNode;
  actionLabel: string;
}) => {
  const auth = useAuth();
  const { isOpen: showWalletConnect, open: openWalletConnect, close: closeWalletConnect } = useModal();
  const { isOpen: showProfileModal, open: openProfileModal, close: closeProfileModal } = useModal();
  

  const handleSignInClick = () => {
    openWalletConnect();
  };

  const handleProfileClick = () => {
    openProfileModal();
  };

  if (auth.state === 'not-signed-in') {
    return (
      <>
        <SaveButton type="button" onClick={handleSignInClick}>
          <LoginIcon size="1rem" color={theme.colors.background.white} />
          Sign in to {actionLabel}
        </SaveButton>
        <ModalOverlay isOpen={showWalletConnect} onClick={closeWalletConnect}>
          <WalletConnectMenu isOpen={showWalletConnect} onClose={closeWalletConnect}></WalletConnectMenu>
        </ModalOverlay>
      </>
    );
  }

  if (auth.state === 'signed-in-no-profile' || auth.state === 'signed-in-loading-profile') { //TODO: add loading button state
    return (
      <>
        <SaveButton type="button" onClick={handleProfileClick}>
          <AvatarPlusIcon size="1.25rem" color={theme.colors.background.white} />
          Create a profile to {actionLabel}
        </SaveButton>
        <ProfileCreationModal isOpen={showProfileModal} onClose={closeProfileModal} />
      </>
    );
  }

  // User is fully authenticated - render the actual save button
  return children;
};

export default AuthGuardSaveButton;