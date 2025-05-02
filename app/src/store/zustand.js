import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import { rehydrateWallet } from '../wallet/wallets';

const useStore = create(
  persist(
    (set) => ({
      wallet : null,
      setWallet : (wallet) => {
        console.log("wallet update hit with:", wallet)
        set({wallet})
      },
      network: 'signet',
      platformFee: 2500,
      platformAddress: '',
      ownerFee: 2500
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

        return returnedState;
      }
    }
  )
);

export default useStore;