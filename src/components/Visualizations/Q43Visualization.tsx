import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';
import { BarDataItem, UseHorizontalBarDataOptions } from '../../hooks/useHorizontalBarData';

const categoryOrder = [
  '0','1', '2', '3', '4+'
];

const categoryLabels: Record<string, string> = {
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4+': '4 or more',
};

// Custom data processor to aggregate categories 4-10 into "4+"
const dataProcessor = (filteredData: any[], options: UseHorizontalBarDataOptions): BarDataItem[] => {
  const { dataField, categoryOrder, categoryLabels } = options;
  
  // Initialize category counts with zeros
  const categoryGroups: Record<string, number> = {};
  for (const category of categoryOrder) {
    categoryGroups[category] = 0;
  }

  let validResponses = 0;
  
  filteredData.forEach((d: any) => {
    const rawValue = d[dataField];
    
    // Skip empty or invalid values (but NOT "0")
    if (!rawValue || rawValue === '-8' || (rawValue.trim && rawValue.trim() === '')) {
      return;
    }
    
    const numValue = parseInt(String(rawValue).trim());
    
    if (!isNaN(numValue)) {
      let category: string;
      
      if (numValue >= 0 && numValue <= 3) {
        category = String(numValue);
      } else if (numValue >= 4) {
        category = '4+';
      } else {
        return; // Skip invalid values
      }
      
      if (categoryGroups.hasOwnProperty(category)) {
        categoryGroups[category]++;
        validResponses++;
      }
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
  
  return processedData;
};

const Q43Visualization: React.FC = () => {
  return (
    <HorizontalBarChart
      questionId="Q43"
      title={"How many people in your household have a valid driver's license or permit (including yourself)?"}
      dataField="hh_license"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      
      dataProcessor={dataProcessor}
    />
  );
};

export default Q43Visualization; 