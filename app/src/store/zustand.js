import {create} from 'zustand';
import {persist} from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      wallet : null,
      setWallet : (wallet) => set({wallet})
    }),
    {
      name : 'vermilion-storage',
    }
  )
);

export default useStore;