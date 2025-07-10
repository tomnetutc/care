import { useState, useEffect } from 'react';
import { useFilters } from '../context/FilterContext';
import DataService from '../services/DataService';

export interface GroupedDistanceDataItem {
  label: string;
  [key: string]: string | number;
}

const DISTANCE_CATEGORIES = [
  '0-1 miles',
  '2-5 miles',
  '6-10 miles',
  '11-20 miles',
  '21-50 miles',
  '50+ miles',
];

const DISTANCE_LABELS: Record<string, string> = {
  '0-1 miles': 'Less than 2 miles',
  '2-5 miles': '2-5 miles',
  '6-10 miles': '6-10 miles',
  '11-20 miles': '11-20 miles',
  '21-50 miles': '21-50 miles',
  '50+ miles': 'More than 50 miles',
};

const WORK_SPECIAL_CASES = [
  'work from home', 'wfh', 'home', 'remote', 'telecommute',
  'n/a', 'na', 'not applicable'
];
const SCHOOL_SPECIAL_CASES = [
  'online', 'virtual', 'remote', 'distance learning', 'home school', 'homeschool',
  'n/a', 'na', 'not applicable', '0', 'zero'
];

function categorizeDistance(value: string | number, isWork: boolean): string | null {
  if (typeof value === 'number') value = value.toString();
  if (!value || value === '-8') return null;
  const v = value.toString().toLowerCase().trim();
  if (isWork && WORK_SPECIAL_CASES.includes(v)) return '0-1 miles';
  if (!isWork && SCHOOL_SPECIAL_CASES.includes(v)) return '0-1 miles';
  const num = parseFloat(v);
  if (!isNaN(num)) {
    if (num >= 0 && num < 2) return '0-1 miles';
    if (num >= 2 && num <= 5) return '2-5 miles';
    if (num > 5 && num <= 10) return '6-10 miles';
    if (num > 10 && num <= 20) return '11-20 miles';
    if (num > 20 && num <= 50) return '21-50 miles';
    if (num > 50) return '50+ miles';
  }
  return null;
}

export const useGroupedDistanceData = () => {
  const [data, setData] = useState<GroupedDistanceDataItem[]>([]);
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
    // eslint-disable-next-line
  }, [filters]);

  const processData = (parsedData: any[]) => {
    try {
      let filteredData = parsedData;
      if (filters.length > 0) {
        filteredData = parsedData.filter(row =>
          filters.every(filter => String(row[filter.field]) === String(filter.value))
        );
      }
      // Count for each category
      const workCounts: Record<string, number> = {};
      const schoolCounts: Record<string, number> = {};
      let workTotal = 0;
      let schoolTotal = 0;
      DISTANCE_CATEGORIES.forEach(cat => {
        workCounts[cat] = 0;
        schoolCounts[cat] = 0;
      });
      filteredData.forEach(row => {
        const workCat = categorizeDistance(row['work_dist'], true);
        if (workCat && workCounts.hasOwnProperty(workCat)) {
          workCounts[workCat]++;
          workTotal++;
        }
        const schoolCat = categorizeDistance(row['school_dist'], false);
        if (schoolCat && schoolCounts.hasOwnProperty(schoolCat)) {
          schoolCounts[schoolCat]++;
          schoolTotal++;
        }
      });
      // Build data array
      const result: GroupedDistanceDataItem[] = DISTANCE_CATEGORIES.map(cat => ({
        label: cat,
        'Distance to Work': workTotal > 0 ? (workCounts[cat] / workTotal) * 100 : 0,
        'Distance to School': schoolTotal > 0 ? (schoolCounts[cat] / schoolTotal) * 100 : 0,
      }));
      setData(result);
      setIsLoading(false);
      // Save totals for return
      (useGroupedDistanceData as any)._workTotal = workTotal;
      (useGroupedDistanceData as any)._schoolTotal = schoolTotal;
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, labels: DISTANCE_LABELS, workTotal: (useGroupedDistanceData as any)._workTotal || 0, schoolTotal: (useGroupedDistanceData as any)._schoolTotal || 0 };
}; 