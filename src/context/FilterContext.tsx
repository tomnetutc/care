import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface FilterOption {
  field: string;
  value: string | number;
}

interface FilterContextType {
  filters: FilterOption[];
  addFilter: (filter: FilterOption) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterOption[]>([]);

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
    <FilterContext.Provider value={{ filters, addFilter, removeFilter, clearFilters }}>
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