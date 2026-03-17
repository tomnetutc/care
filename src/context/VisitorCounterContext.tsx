import React, { createContext, useContext } from 'react';
import { useVisitorCounter } from '../hooks/useVisitorCounter';

interface VisitorCounterContextType {
  totalCount: number | null;
  uniqueCount: number | null;
}

const VisitorCounterContext = createContext<VisitorCounterContextType>({
  totalCount: null,
  uniqueCount: null,
});

export const VisitorCounterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { totalCount, uniqueCount } = useVisitorCounter();
  return (
    <VisitorCounterContext.Provider value={{ totalCount, uniqueCount }}>
      {children}
    </VisitorCounterContext.Provider>
  );
};

export const useVisitorCounterContext = () => useContext(VisitorCounterContext);
