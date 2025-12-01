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
    
    // Use sourceCategories if provided, otherwise use responseCategories
    const categoriesToUse = sourceCategories || responseCategories;
    
    // Process data to get distribution percentages for each question
    const processedData: ProcessedDataItem[] = questionOrder.map((column: string) => {
      // Special mapping for Q23-style delivery frequency questions
      const isQ23Style = Array.isArray(responseCategories) && responseCategories.length === 6 &&
        responseCategories[0] === '0' &&
        responseCategories[1] === '1' &&
        responseCategories[2] === '2–3' &&
        responseCategories[3] === '4–6' &&
        responseCategories[4] === '7–10' &&
        responseCategories[5] === '>10';

      // Special mapping for Q20-style frequency questions (0, 1-2 days, 3-4 days, 5+ days)
      const isQ20Style = Array.isArray(responseCategories) && responseCategories.length === 4 &&
        responseCategories[0] === '0' &&
        responseCategories[1] === '1-2 days' &&
        responseCategories[2] === '3-4 days' &&
        responseCategories[3] === '5 or more days' &&
        questionOrder.includes('freq_work') && questionOrder.includes('freq_school') && questionOrder.includes('freq_wfh');

      const responseCounts = new Array(responseCategories.length).fill(0);
      let validResponses = 0;

      filteredData.forEach(d => {
        let value = d[column];
        if (isQ23Style) {
          // Map CSV values 1-6 to indices 0-5
          const intVal = parseInt(value as string);
          // Exclude -8 (refused) and -9 (not applicable/didn't experience)
          if (!isNaN(intVal) && intVal >= 1 && intVal <= 6 && intVal !== -8 && intVal !== -9) {
            responseCounts[intVal - 1]++;
            validResponses++;
          }
        } else if (isQ20Style) {
          // Map CSV values to Q20 categories: 0->0, 1,2->1-2 days, 3,4->3-4 days, 5,6,7->5+ days
          const intVal = parseInt(value as string);
          // Exclude -8 (refused) and -9 (not applicable/didn't experience)
          if (!isNaN(intVal) && intVal >= 0 && intVal <= 7 && intVal !== -8 && intVal !== -9) {
            if (intVal === 0) {
              responseCounts[0]++; // 0
            } else if (intVal === 1 || intVal === 2) {
              responseCounts[1]++; // 1-2 days
            } else if (intVal === 3 || intVal === 4) {
              responseCounts[2]++; // 3-4 days
            } else if (intVal === 5 || intVal === 6 || intVal === 7) {
              responseCounts[3]++; // 5 or more days
            }
            validResponses++;
          }
        } else {
          // Default Likert logic
          const parsed = parseInt(value as string);
          // Exclude -8 (refused) and -9 (not applicable/didn't experience)
          if (isNaN(parsed) || parsed === -8 || parsed === -9) {
            return; // Skip invalid values
          }
          const isZeroBased = responseCategories.includes("0");
          if (isZeroBased) {
            if (parsed >= 0 && parsed < responseCategories.length) {
              responseCounts[parsed]++;
              validResponses++;
            }
          } else {
            if (parsed >= 1 && parsed <= responseCategories.length) {
              responseCounts[parsed - 1]++;
              validResponses++;
            }
          }
        }
      });
      
      // Convert counts to percentages
      const responsePercentages = responseCounts.map(count => 
        validResponses > 0 ? (count / validResponses) * 100 : 0
      );
      
      return {
        question: questionLabels[column] || column,
        values: responseCategories.map((category: string, i: number) => ({
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
        // Exclude -8 (refused) and -9 (not applicable/didn't experience)
        if (!isNaN(value) && value >= 0 && value !== -8 && value !== -9) {
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
    
    // Calculate totalResponses: count rows that have at least one valid response across all questions
    // This excludes rows where all questions have -9 (not applicable) or -8 (refused)
    let totalValidRespondents = 0;
    filteredData.forEach(d => {
      // Check if this row has at least one valid response across all questions
      const hasValidResponse = questionOrder.some((column: string) => {
        const value = parseInt(d[column] as string);
        // Valid if it's a number >= 0 and not -8 or -9
        return !isNaN(value) && value >= 0 && value !== -8 && value !== -9;
      });
      if (hasValidResponse) {
        totalValidRespondents++;
      }
    });
    
    // Set totalResponses to the count of respondents with at least one valid response
    // If all questions have the same sample size, use that; otherwise use the calculated count
    const sampleSizes = calculatedStats.map(stat => stat.responses);
    const allSameSize = sampleSizes.length > 0 && sampleSizes.every(size => size === sampleSizes[0]);
    setTotalResponses(allSameSize && sampleSizes[0] > 0 ? sampleSizes[0] : totalValidRespondents);
    
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