import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import DataService from '../services/DataService'; // Add import

export interface FilterOption {
  field: string;
  value: string | number;
}

interface FilterContextType {
  filters: FilterOption[];
  addFilter: (filter: FilterOption) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  isDataLoading: boolean; // Add this
  dataError: string | null; // Add this
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterOption[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true); // Add this
  const [dataError, setDataError] = useState<string | null>(null); // Add this

  // Add this effect to preload data
  useEffect(() => {
    const preloadData = async () => {
      try {
        setIsDataLoading(true);
        await DataService.getInstance().getData();
        setDataError(null);
      } catch (error) {
        console.error('Error preloading data:', error);
        setDataError((error as Error).message);
      } finally {
        setIsDataLoading(false);
      }
    };

    preloadData();
  }, []);

  const addFilter = (filter: FilterOption) => {
    setFilters(prevFilters => {
      // Remove any existing filter with the same field
      const filtered = prevFilters.filter(f => f.field !== filter.field);
      // Add the new filter
      return [...filtered, filter];
    });
  };

  const removeFilter = (field: string) => {
    setFilters(prevFilters => prevFilters.filter(f => f.field !== field));
  };

  const clearFilters = () => {
    setFilters([]);
  };

  return (
    <FilterContext.Provider value={{ 
      filters, 
      addFilter, 
      removeFilter, 
      clearFilters,
      isDataLoading, // Add this
      dataError      // Add this
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};