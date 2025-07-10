import { useState, useEffect } from 'react';
import { useFilters } from '../context/FilterContext';
import DataService from '../services/DataService';

const modeMapping: Record<number, string> = {
  1: 'Private vehicle, driving alone',
  2: 'Private vehicle, driving with passengers',
  3: 'Private vehicle, riding as a passenger',
  4: 'Carsharing services (e.g., Zipcar)',
  5: 'Bus',
  6: 'Light rail, subway, or other rail',
  7: 'Uber/Lyft/other ridehailing services',
  8: 'Taxi',
  9: 'Bicycle/E-bike (including bike-sharing services)',
  10: 'Scooter/E-scooter (including sharing services)',
  11: 'Walk',
  12: 'Other',
};

const SEGMENTS = [
  { key: 'Employed – Work', column: 'work_mode_choice' },
  { key: 'Employed – Non-work', column: 'nonwork_mode_choice' },
  { key: 'Student – School', column: 'school_mode_choice_student' },
  { key: 'Student – Non-work', column: 'nonwork_mode_choice_student' },
  { key: 'Student & Worker – Work', column: 'work_mode_choice_student_worker' },
  { key: 'Student & Worker – School', column: 'school_mode_choice_student_worker' },
  { key: 'Student & Worker – Non-work', column: 'nonwork_mode_choice_student_worker' },
  { key: 'Unemployed – Non-work', column: 'nonwork_mode_choice_nonemp' },
];

export interface Q22TransportationRow {
  mode: string;
  [segment: string]: string | number;
}

export const useQ22TransportationData = () => {
  const [data, setData] = useState<Q22TransportationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filters, isDataLoading, dataError } = useFilters();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const parsedData = await DataService.getInstance().getData();
        processData(parsedData);
      } catch (err) {
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

  useEffect(() => {
    if (!isLoading && !error) {
      DataService.getInstance().getData().then(processData);
    }
  }, [filters]);

  const processData = (parsedData: any[]) => {
    try {
      let filteredData = parsedData;
      if (filters.length > 0) {
        filteredData = parsedData.filter(row =>
          filters.every(filter => String(row[filter.field]) === String(filter.value))
        );
      }
      const modeRows: Q22TransportationRow[] = Object.entries(modeMapping).map(([modeCode, modeLabel]) => {
        const row: Q22TransportationRow = { mode: modeLabel };
        SEGMENTS.forEach(segment => {
          row[segment.key] = 0;
        });
        return row;
      });
      const modeCodeToIndex: Record<string, number> = {};
      Object.keys(modeMapping).forEach((code, idx) => {
        modeCodeToIndex[code] = idx;
      });
      filteredData.forEach(d => {
        SEGMENTS.forEach(segment => {
          const val = d[segment.column];
          if (val && val !== '-8') {
            const code = String(val).trim();
            if (modeCodeToIndex[code] !== undefined) {
              const idx = modeCodeToIndex[code];
              modeRows[idx][segment.key] = (modeRows[idx][segment.key] as number) + 1;
            }
          }
        });
      });
      setData(modeRows);
      setIsLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  return { data, isLoading, error };
}; 