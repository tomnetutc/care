import { useState, useEffect } from 'react';
import { useFilters } from '../context/FilterContext';
import DataService from '../services/DataService';

export interface BarDataItem {
  category: string;
  label: string;
  count: number;
  percentage: number;
}

export interface UseHorizontalBarDataOptions {
  dataField: string;
  categoryOrder: string[];
  categoryLabels: Record<string, string>;
  valueMap?: Record<string, string>;
  alternateFields?: string[];
  dataProcessor?: (filteredData: any[], options: UseHorizontalBarDataOptions) => BarDataItem[];
  multiSelectFields?: Record<string, string>; // Map of field names to category labels for multi-select questions
  percentageDenominator?: 'uniqueRespondents' | 'totalSelections'; // New option
}

export const useHorizontalBarData = (options: UseHorizontalBarDataOptions) => {
  const [data, setData] = useState<BarDataItem[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResponses, setTotalResponses] = useState(0);
  
  // Extract options
  const { dataField, categoryOrder, categoryLabels, valueMap = {}, alternateFields = [], dataProcessor, multiSelectFields } = options;
  
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

      // Exclude -8, -9, blank, or null values globally
      if (multiSelectFields) {
        filteredData = filteredData.filter(row =>
          Object.keys(multiSelectFields).some(field => {
            const val = String(row[field]);
            return val !== "-8" && val !== "-9" && val !== "" && val != null;
          })
        );
      } else {
        filteredData = filteredData.filter(row => {
          const val = String(row[dataField]);
          return val !== "-8" && val !== "-9" && val !== "" && val != null;
        });
      }

      // If a custom dataProcessor is provided, use it
      if (dataProcessor) {
        setData(dataProcessor(filteredData, options));
        setIsLoading(false);
        return;
      }

      // Handle multi-select questions
      if (multiSelectFields) {
        // Initialize category counts with zeros
        const categoryGroups: Record<string, number> = {};
        for (const category of categoryOrder) {
          categoryGroups[category] = 0;
        }

        // Track all bar counts (total selections) and unique respondents
        let totalSelections = 0;
        let validRespondents = 0;

        filteredData.forEach((row: any) => {
          let selectedAny = false;
          Object.entries(multiSelectFields).forEach(([fieldName, categoryLabel]) => {
            if (categoryLabel === "Other") {
              if (
                row[fieldName] === "1" ||
                (row[fieldName] && String(row[fieldName]).trim() !== "" && row[fieldName] !== "0" && row[fieldName] !== "-8")
              ) {
                categoryGroups[categoryLabel]++;
                totalSelections++;
                selectedAny = true;
              }
            } else {
              if (row[fieldName] === "1") {
                categoryGroups[categoryLabel]++;
                totalSelections++;
                selectedAny = true;
              }
            }
          });
          if (selectedAny) validRespondents++;
        });

        // Choose denominator based on option
        const denominatorType = options.percentageDenominator || 'uniqueRespondents';
        const denominator = denominatorType === 'totalSelections' ? totalSelections : validRespondents;

        // Convert counts to array of objects with percentages
        const processedData: BarDataItem[] = categoryOrder.map(category => {
          const count = categoryGroups[category] || 0;
          return {
            category,
            label: categoryLabels[category] || category,
            count,
            percentage: denominator > 0 ? (count / denominator) * 100 : 0
          };
        });

        setData(processedData);
        setIsLoading(false);
        setTotalResponses(validRespondents);
        return;
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
        
        // Skip empty or invalid values (but NOT "0")
        // Exclude -8 (refused) and -9 (not applicable/didn't experience)
        if (!rawValue || rawValue === '-8' || rawValue === '-9' || String(rawValue).trim() === '-9' || (rawValue.trim && rawValue.trim() === '')) {
          return;
        }
        
        let category: string | undefined;
        
        // Special handling for distance fields - use numeric categorization
        if (dataField === 'work_dist' || dataField === 'school_dist') {
          const numValue = parseFloat(String(rawValue).trim());
          
          if (!isNaN(numValue)) {
            // Categorize based on numeric value
            if (numValue >= 0 && numValue < 2) category = "0-1 miles";
            else if (numValue >= 2 && numValue <= 5) category = "2-5 miles";
            else if (numValue > 5 && numValue <= 10) category = "6-10 miles";
            else if (numValue > 10 && numValue <= 20) category = "11-20 miles";
            else if (numValue > 20 && numValue <= 50) category = "21-50 miles";
            else if (numValue > 50) category = "50+ miles";
          } else {
            // Handle text values through valueMap for distance fields
            const textValue = String(rawValue).toLowerCase().trim();
            if (valueMap[textValue]) {
              category = valueMap[textValue];
            }
          }
        } else {
          // For other fields, use existing logic
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
        }
        
        if (category && categoryGroups.hasOwnProperty(category)) {
          categoryGroups[category]++;
          validResponses++;
        }
      });
      
      // Convert counts to array of objects with percentages
      const processedData: BarDataItem[] = categoryOrder.map(category => {
        const count = categoryGroups[category] || 0;
        return {
          category,
          label: categoryLabels[category] || category,
          count,
          percentage: validResponses > 0 ? (count / validResponses) * 100 : 0
        };
      });
      
      setData(processedData);
      setIsLoading(false);
      // Set totalResponses to the actual count of valid responses (excluding -9 values)
      setTotalResponses(validResponses);
      
    } catch (err) {
      console.error('Error processing data:', err);
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, totalResponses };
};