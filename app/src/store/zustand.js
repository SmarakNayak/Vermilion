import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode'; // jsonwebtoken not compatible with bun
import { rehydrateWallet } from '../wallet/wallets';

let logoutTimeout = null; 

const useStore = create(
  persist(
    (set) => ({
      wallet : null,
      authToken : null,
      network: 'mainnet',
      platformFee: 2500,
      platformAddress: 'bc1qkj2tgqf5f2jvksgreljarwu63lgnp5nu25g3gm',
      ownerFee: 2500,

      // Set wallet
      setWallet : (wallet) => {
        set({wallet})
      },

      // Set auth token
      setAuthToken : (authToken) => {
        set({authToken})

        // Clear any existing logout timeout
        if (logoutTimeout) {
          clearTimeout(logoutTimeout);
        }

        if (authToken) {
          // Decode the token to get the expiration time
          const decoded = jwtDecode(authToken);
          if (decoded && decoded.exp) {
            const expiryTime = decoded.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            const remainingTime = expiryTime - currentTime;

            if (remainingTime > 0) {
              // Set a timeout to trigger logout when the token expires
              logoutTimeout = setTimeout(() => {
                set({ authToken: null, wallet: null }); // Clear auth and wallet state
                console.log("Token expired, logging out...");
              }, remainingTime);
            } else {
              // If the token is already expired, log out immediately
              set({ authToken: null, wallet: null });
              console.log("Token expired, logging out...");
            }
          }
        }
      },

      logout: () => {
        // Clear auth and wallet state
        set({ authToken: null, wallet: null });

        // Clear any existing logout timeout
        if (logoutTimeout) {
          clearTimeout(logoutTimeout);
        }
        console.log("User logged out");
      },
    }),
    {
      name : 'vermilion-storage',
      merge : (persistedState, currentState) => {
        // Do a shallow merge of the current state into the persisted state (current overwrites persisted)
        let returnedState = {
          ...persistedState,
          ...currentState,
        };

        // Rehydrate wallet instance if wallet data exists
        if (persistedState.wallet) {
          let rehydratedWallet = rehydrateWallet(persistedState.wallet);
          returnedState.wallet = rehydratedWallet;
        }
        if (persistedState.authToken) {
          returnedState.authToken = persistedState.authToken;
        }

        return returnedState;
      }
    }
  )
);

export default useStore;
