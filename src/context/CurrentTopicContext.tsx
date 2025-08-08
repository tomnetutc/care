import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface CurrentTopicContextType {
  currentTopicLabel: string | null;
  setCurrentTopicLabel: (label: string | null) => void;
  getCurrentTopicLabel: () => string | null;
  setCurrentTopicLabelSync: (label: string | null) => void;
}

const CurrentTopicContext = createContext<CurrentTopicContextType | undefined>(undefined);

export const useCurrentTopic = () => {
  const context = useContext(CurrentTopicContext);
  if (context === undefined) {
    throw new Error('useCurrentTopic must be used within a CurrentTopicProvider');
  }
  return context;
};

interface CurrentTopicProviderProps {
  children: ReactNode;
}

export const CurrentTopicProvider: React.FC<CurrentTopicProviderProps> = ({ children }) => {
  const [currentTopicLabel, setCurrentTopicLabelState] = useState<string | null>(null);

  const setCurrentTopicLabel = useCallback((label: string | null) => {
    setCurrentTopicLabelState(label);
  }, []);

  const setCurrentTopicLabelSync = useCallback((label: string | null) => {
    // Force synchronous update
    setCurrentTopicLabelState(label);
  }, []);

  const getCurrentTopicLabel = useCallback(() => {
    return currentTopicLabel;
  }, [currentTopicLabel]);

  return (
    <CurrentTopicContext.Provider value={{ 
      currentTopicLabel, 
      setCurrentTopicLabel, 
      getCurrentTopicLabel,
      setCurrentTopicLabelSync 
    }}>
      {children}
    </CurrentTopicContext.Provider>
  );
}; 