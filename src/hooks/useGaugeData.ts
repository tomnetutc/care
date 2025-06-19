import { useState, useEffect } from 'react';
import { useFilters } from '../context/FilterContext';
import DataService from '../services/DataService';

export interface GaugeDataResult {
  value: number;
  summary: SummaryStatistic | null;
  isLoading: boolean;
  error: string | null;
}

export interface SummaryStatistic {
  field: string;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  variance: number;
  responses: number;
}

export interface UseGaugeDataOptions {
  dataField: string;
  title?: string;
}

export const useGaugeData = (options: UseGaugeDataOptions): GaugeDataResult => {
  const [summary, setSummary] = useState<SummaryStatistic | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState(0);
  
  const { filters, isDataLoading, dataError } = useFilters();
  const { dataField, title } = options;

  // Load data once using the data service
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const parsedData = await DataService.getInstance().getData();
        setRawData(parsedData);
        processData(parsedData);
      } catch (err) {
        console.error('Error loading gauge data:', err);
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

  const processData = (parsedData: any[]) => {
    if (!parsedData || parsedData.length === 0) {
      setError("No data available");
      setIsLoading(false);
      return;
    }

    try {
      // Apply filters
      let filteredData = parsedData;
      
      if (filters.length > 0) {
        filteredData = parsedData.filter(row => {
          return filters.every(filter => {
            const rowValue = String(row[filter.field]);
            return rowValue === String(filter.value);
          });
        });
      }
      
      // Extract values from the data
      const values: number[] = [];
      let validResponses = 0;
      
      filteredData.forEach(d => {
        const value = parseFloat(d[dataField]);
        if (!isNaN(value) && value >= 0 && value <= 10) {
          values.push(value);
          validResponses++;
        }
      });

      if (validResponses === 0) {
        setError("No valid responses found for this question");
        setIsLoading(false);
        return;
      }
      
      // Calculate statistics
      const min = values.length > 0 ? Math.min(...values) : 0;
      const max = values.length > 0 ? Math.max(...values) : 0;
      const mean = validResponses > 0 ? values.reduce((sum, val) => sum + val, 0) / validResponses : 0;
      const variance = validResponses > 0 ? values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validResponses : 0;
      const stdDev = Math.sqrt(variance);
      
      const stats: SummaryStatistic = {
        field: title || dataField,
        min,
        max,
        mean,
        stdDev,
        variance,
        responses: validResponses
      };
      
      setSummary(stats);
      setValue(mean);
      setIsLoading(false);
      
    } catch (err) {
      console.error('Error processing gauge data:', err);
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  return { value, summary, isLoading, error };
};