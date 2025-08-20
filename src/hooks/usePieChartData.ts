import { useState, useEffect } from 'react';
import { useFilters } from '../context/FilterContext';
import DataService from '../services/DataService';

export interface PieDataItem {
  name: string;
  label: string;
  value: number;
  count: number;
}

export interface UsePieChartDataOptions {
  dataField: string;
  categoryOrder: string[];
  categoryLabels: Record<string, string>;
  valueMap?: Record<string, string>;
  alternateFields?: string[];
}

export const usePieChartData = (options: UsePieChartDataOptions) => {
  const [data, setData] = useState<PieDataItem[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResponses, setTotalResponses] = useState(0);
  
  // Extract options
  const { dataField, categoryOrder, categoryLabels, valueMap = {}, alternateFields = [] } = options;
  
  // Get filters from context
  const { filters, isDataLoading, dataError } = useFilters();

  // Load data once using the data service
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const parsedData = await DataService.getInstance().getData();
        setRawData(parsedData);
        processData(parsedData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError((err as Error).message);
        setIsLoading(false);
      }
    };

    if (!isDataLoading) {
      if (dataError) {
        setError(dataError);
        setIsLoading(false);
      } else {
        loadData();
      }
    }
  }, [isDataLoading, dataError]);

  // Reprocess data when filters change
  useEffect(() => {
    if (rawData.length > 0) {
      processData(rawData);
    }
  }, [filters, rawData, dataField]);

  // Process data with filters applied
  const processData = (parsedData: any[]) => {
    try {
      // Apply filters to the data
      let filteredData = parsedData;
      
      if (filters.length > 0) {
        filteredData = parsedData.filter(row => {
          // Group filters by field to handle multiple values for same field
          const filtersByField: Record<string, string[]> = {};
          filters.forEach(filter => {
            if (!filtersByField[filter.field]) {
              filtersByField[filter.field] = [];
            }
            
            // Special handling for disability filter
            if (filter.field === 'travel_disability') {
              if (filter.value === 'yes') {
                // Map "Yes (Disabled)" to values 2, 3, 4 (any disability)
                filtersByField[filter.field].push('2', '3', '4');
              } else if (filter.value === 'no') {
                // Map "No (Disabled)" to value 1 (no disability)
                filtersByField[filter.field].push('1');
              } else {
                filtersByField[filter.field].push(String(filter.value));
              }
            }
            // Special handling for gender filter - combine Other and Prefer not to answer
            else if (filter.field === 'gender' && filter.value === '4') {
              // When "Other" is selected, include both "Other" (4) and "Prefer not to answer" (3)
              filtersByField[filter.field].push('3', '4');
            } else {
              filtersByField[filter.field].push(String(filter.value));
            }
          });
          
          // Check if row matches any of the filter combinations
          return Object.entries(filtersByField).every(([field, values]) => {
            const rowValue = String(row[field]);
            return values.includes(rowValue);
          });
        });
      }

      // Initialize category counts with zeros
      const categoryGroups: Record<string, number> = {};
      for (const category of categoryOrder) {
        categoryGroups[category] = 0;
      }

      // Process the filtered CSV data
      let validResponses = 0;
      
      filteredData.forEach((d: any) => {
        const rawValue = d[dataField];
        
        // Skip empty or invalid values
        if (rawValue === null || rawValue === undefined || rawValue === '-8' || (rawValue.trim && rawValue.trim() === '')) {
          return;
        }
        
        let category: string | undefined;
        
        // Direct match in category order
        if (categoryOrder.includes(rawValue)) {
          category = rawValue;
        }
        // Check if value exists in valueMap
        else if (valueMap[rawValue]) {
          category = valueMap[rawValue];
        }
        // Try alternate fields
        else {
          for (const field of alternateFields) {
            if (d[field] && (categoryOrder.includes(d[field]) || valueMap[d[field]])) {
              category = categoryOrder.includes(d[field]) ? d[field] : valueMap[d[field]];
              break;
            }
          }
        }
        
        if (category && categoryGroups.hasOwnProperty(category)) {
          categoryGroups[category]++;
          validResponses++;
        }
      });
      
      // Convert counts to array of objects with percentages
      const processedData: PieDataItem[] = categoryOrder.map(category => {
        const count = categoryGroups[category] || 0;
        return {
          name: category,
          label: categoryLabels[category] || category,
          value: validResponses > 0 ? (count / validResponses) * 100 : 0,
          count
        };
      });
      
      setData(processedData);
      setTotalResponses(validResponses);
      setIsLoading(false);
      
    } catch (err) {
      console.error('Error processing data:', err);
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, totalResponses };
};