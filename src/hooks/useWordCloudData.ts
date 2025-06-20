import { useState, useEffect } from 'react';
import { useFilters } from '../context/FilterContext';
import DataService from '../services/DataService';

export interface WordCloudWord {
  text: string;
  value: number;
}

export interface UseWordCloudDataOptions {
  dataField: string;
  maxWords?: number;
  minWordLength?: number;
  stopWords?: string[];
  useBigrams?: boolean;
}

export interface WordCloudDataResult {
  words: WordCloudWord[];
  isLoading: boolean;
  error: string | null;
}

export const useWordCloudData = (options: UseWordCloudDataOptions): WordCloudDataResult => {
  const [words, setWords] = useState<WordCloudWord[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { filters, isDataLoading, dataError } = useFilters();
  const { 
    dataField,
    maxWords = 50,
    minWordLength = 2,
    useBigrams = true,
    stopWords = ['the', 'and', 'for', 'you', 'with', 'would', 'not', 'but', 'are', 'this', 
                'have', 'that', 'more', 'they', 'there', 'been', 'has', 'was', 'will', 'its',
                'just', 'from', 'all', 'can', 'any', 'some', 'what', 'who', 'when', 'how',
                'which', 'their', 'about', 'like', 'your', 'very', 'than'] 
  } = options;

  // Load data once using the data service
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const parsedData = await DataService.getInstance().getData();
        setRawData(parsedData);
        processData(parsedData);
      } catch (err) {
        console.error('Error loading word cloud data:', err);
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
  }, [filters, rawData, dataField, maxWords, minWordLength, useBigrams, JSON.stringify(stopWords)]);

  const processData = (parsedData: any[]) => {
    try {
      // Apply filters if any
      let filteredData = parsedData;
      if (filters.length > 0) {
        filteredData = parsedData.filter(row => {
          return filters.every(filter => {
            const rowValue = String(row[filter.field]);
            return rowValue === String(filter.value);
          });
        });
      }

      // Extract relevant comments
      const comments = filteredData
        .map(row => row[dataField]?.trim())
        .filter(Boolean) as string[];

      if (comments.length === 0) {
        setWords([]);
        setIsLoading(false);
        return;
      }

      // Process words based on whether we're using bigrams or single words
      if (useBigrams) {
        const bigramCounts: Record<string, number> = {};

        comments.forEach(comment => {
          const cleaned = comment
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .split(/\s+/)
            .filter(w => w && w.length >= minWordLength && !stopWords.includes(w));

          for (let i = 0; i < cleaned.length - 1; i++) {
            const bigram = `${cleaned[i]} ${cleaned[i + 1]}`;
            bigramCounts[bigram] = (bigramCounts[bigram] || 0) + 1;
          }
        });

        const topBigrams = Object.entries(bigramCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, maxWords)
          .map(([text, value]) => ({ text, value }));

        setWords(topBigrams);
      } 
      else {
        // Process single words
        const wordCounts: Record<string, number> = {};

        comments.forEach(comment => {
          const words = comment
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .split(/\s+/)
            .filter(w => w && w.length >= minWordLength && !stopWords.includes(w));

          words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
          });
        });

        const topWords = Object.entries(wordCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, maxWords)
          .map(([text, value]) => ({ text, value }));

        setWords(topWords);
      }

      setIsLoading(false);
    } 
    catch (err) {
      console.error('Error processing word cloud data:', err);
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  return { words, isLoading, error };
};