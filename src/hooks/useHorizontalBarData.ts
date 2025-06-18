import { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { useFilters } from '../context/FilterContext';

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
}

export const useHorizontalBarData = (options: UseHorizontalBarDataOptions) => {
  const [data, setData] = useState<BarDataItem[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResponses, setTotalResponses] = useState(0);
  
  // Extract options
  const { dataField, categoryOrder, categoryLabels, valueMap = {}, alternateFields = [] } = options;
  
  // Get filters from context
  const { filters } = useFilters();

  // Load data once on hook initialization
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.PUBLIC_URL}/leaphi_final_data.csv`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const csvText = await response.text();
        const parsedData = d3.csvParse(csvText);
        
        // Store the raw parsed data
        setRawData(parsedData);
        
        // Process the data with applied filters
        processData(parsedData);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError((err as Error).message);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
          return filters.every(filter => {
            const rowValue = String(row[filter.field]);
            return rowValue === String(filter.value);
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
        
        // Skip empty or invalid values (but NOT "0")
        if (!rawValue || rawValue === '-8' || (rawValue.trim && rawValue.trim() === '')) {
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