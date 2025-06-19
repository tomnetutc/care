import { useState, useEffect } from 'react';
import { useFilters } from '../context/FilterContext';
import { DataItem, ProcessedDataItem, SummaryStatistic, LikertDataOptions } from '../types/Helpers';
import DataService from '../services/DataService';

export const useLikertData = (options: LikertDataOptions) => {
  const [data, setData] = useState<ProcessedDataItem[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStatistic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResponses, setTotalResponses] = useState<number>(0);
  const [rawData, setRawData] = useState<DataItem[]>([]);
  
  const { filters, isDataLoading, dataError } = useFilters();
  const { questionOrder, questionLabels, responseCategories, sourceCategories, dataProcessor } = options;

  // Load data using the data service
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const parsedData = await DataService.getInstance().getData();
        setRawData(parsedData as unknown as DataItem[]);
        processData(parsedData as unknown as DataItem[]);
      } catch (err) {
        console.error('Error loading data:', err);
        setError((err as Error).message);
        setIsLoading(false);
      }
    };

    // Only load if global data loading is complete
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
  }, [filters, rawData, questionOrder, questionLabels, responseCategories, dataProcessor]);

  // Process data with filters applied
  const processData = (parsedData: DataItem[]) => {
    // Apply filters
    let filteredData = parsedData;
    
    if (filters.length > 0) {
      filteredData = parsedData.filter(row => {
        // Check if the row passes all filters
        return filters.every(filter => {
          const rowValue = String(row[filter.field]);
          return rowValue === String(filter.value);
        });
      });
    }
    
    // Set total responses after filtering
    setTotalResponses(filteredData.length);
    
    // Use sourceCategories if provided, otherwise use responseCategories
    const categoriesToUse = sourceCategories || responseCategories;
    
    // Process data to get distribution percentages for each question
    const processedData: ProcessedDataItem[] = questionOrder.map((column: string) => {
      // Count responses in each category
      const responseCounts = new Array(categoriesToUse.length).fill(0);
      let validResponses = 0;
      
      filteredData.forEach(d => {
        const value = parseInt(d[column] as string);
        const isZeroBased = categoriesToUse.includes("0");
        
        if (isZeroBased) {
          // For 0-based scales (0,1,2,3,4,5,6,7)
          if (!isNaN(value) && value >= 0 && value < categoriesToUse.length) {
            responseCounts[value]++;
            validResponses++;
          }
        } else {
          // For 1-based scales (1,2,3,4,5) - existing logic
          if (!isNaN(value) && value >= 1 && value <= categoriesToUse.length) {
            responseCounts[value - 1]++;
            validResponses++;
          }
        }
      });
      
      // Convert counts to percentages
      const responsePercentages = responseCounts.map(count => 
        validResponses > 0 ? (count / validResponses) * 100 : 0
      );
      
      return {
        question: questionLabels[column] || column,
        values: categoriesToUse.map((category: string, i: number) => ({
          category,
          value: responsePercentages[i],
          count: responseCounts[i]
        }))
      };
    });

    // Apply custom data processor if provided (only affects visualization data)
    const finalData = dataProcessor ? dataProcessor(processedData) : processedData;
    setData(finalData);
    
    // Calculate summary statistics using the ORIGINAL data (not the processed ones)
    // This preserves the accurate statistics based on individual responses
    const calculatedStats: SummaryStatistic[] = questionOrder.map((column: string) => {
      const values: number[] = [];
      let validResponses = 0;
      
      filteredData.forEach(d => {
        const value = parseInt(d[column] as string);
        if (!isNaN(value) && value >= 0) {
          values.push(value);
          validResponses++;
        }
      });
      
      // Calculate statistics with safety checks for empty arrays
      const min = values.length > 0 ? Math.min(...values) : 0;
      const max = values.length > 0 ? Math.max(...values) : 0;
      const mean = validResponses > 0 ? values.reduce((sum, val) => sum + val, 0) / validResponses : 0;
      const variance = validResponses > 0 ? values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validResponses : 0;
      const stdDev = Math.sqrt(variance);
      
      return {
        question: questionLabels[column] || column,
        min,
        max,
        mean,
        stdDev,
        variance,
        responses: validResponses
      };
    });

    setSummaryStats(calculatedStats);
    setIsLoading(false);
  };

  return { data, summaryStats, isLoading, error, totalResponses };
};

// Helper function to sanitize text for use as CSS class names
export const sanitizeForCssSelector = (text: string): string => {
  return text
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
};