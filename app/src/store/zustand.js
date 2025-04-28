import {create} from 'zustand';
import {persist} from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      wallet : null,
      setWallet : (wallet) => {
        console.log("wallet update hit with:", wallet)
        set({wallet})
      },
    }),
    {
      name : 'vermilion-storage',
    }
  )
);

export default useStore;