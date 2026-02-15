import {createStores, Stores} from '@/stores';
import {createContext, ReactNode, useContext, useState} from 'react';

type StoresContextType = Stores & {resetStores: VoidFunction};
const StoresContext = createContext<StoresContextType | undefined>(undefined);

export const StoresProvider = ({children}: {children: ReactNode}) => {
  const [stores, setStores] = useState(() => createStores());

  return (
    <StoresContext.Provider value={{...stores, resetStores: () => setStores(createStores())}}>
      {children}
    </StoresContext.Provider>
  );
};

export const useStores = (): StoresContextType => {
  const context = useContext(StoresContext);

  if (!context) {
    throw new Error('useStores должен вызываться внутри StoresProvider, проверьте, что вы подключили провайдер');
  }

  return context;
};
