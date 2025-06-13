import { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { useFilters } from '../context/FilterContext';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { filters } = useFilters();
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.PUBLIC_URL}/leaphi_final_data.csv`);
        if (!response.ok) throw new Error('Failed to fetch data');

        const csvText = await response.text();
        const parsedData = d3.csvParse(csvText) as d3.DSVRowArray<string>;
        
        // Apply filters if any
        let filteredData = parsedData;
        if (filters.length > 0) {
          // Create a filtered array but preserve the columns property
          const filtered = parsedData.filter(row => {
            return filters.every(filter => {
              const rowValue = String(row[filter.field]);
              return rowValue === String(filter.value);
            });
          });
          
          // Copy the columns property to maintain the DSVRowArray type
          filteredData = Object.assign(filtered, { columns: parsedData.columns });
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
            const cleaned = comment
              .toLowerCase()
              .replace(/[^a-zA-Z0-9\s]/g, '')
              .split(/\s+/)
              .filter(w => w && w.length >= minWordLength && !stopWords.includes(w));

            cleaned.forEach(word => {
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
        console.error('Error loading word cloud data:', err);
        setError((err as Error).message);
        setIsLoading(false);
      }
    };

    loadData();
  }, [dataField, maxWords, minWordLength, useBigrams, JSON.stringify(stopWords), JSON.stringify(filters)]);

  return { words, isLoading, error };
};