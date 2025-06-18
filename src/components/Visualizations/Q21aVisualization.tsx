import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q21aVisualization: React.FC = () => {
  // Define distance categories in logical order (removed "Work from home")
  const categoryOrder = [
    "0-1 miles",
    "2-5 miles", 
    "6-10 miles",
    "11-20 miles",
    "21-50 miles",
    "50+ miles"
  ];
  
  // Labels for distance categories
  const categoryLabels: {[key: string]: string} = {
    "0-1 miles": "Less than 2 miles",
    "2-5 miles": "2-5 miles",
    "6-10 miles": "6-10 miles", 
    "11-20 miles": "11-20 miles",
    "21-50 miles": "21-50 miles",
    "50+ miles": "More than 50 miles"
  };
  
  // Color scheme from close (green) to far (red) distances
  const categoryColors = [
    "#218066",  // 0-1 miles  (darkest green)
    "#2ba88c",  // 2-5 miles  (green)
    "#93c4b9",  // 6-10 miles (light green)
    "#ead97c",  // 11-20 miles (yellow)
    "#f0b3ba",  // 21-50 miles (light red)
    "#e25b61"   // 50+ miles  (red)
  ];
  
  // Create minimal value mapping - let the hook handle numeric conversion
  const createValueMap = (): Record<string, string> => {
    const valueMap: Record<string, string> = {};
    
    // Only handle special text cases that might exist in the data
    const specialCases = [
      "work from home", "wfh", "home", "remote", "telecommute", 
      "n/a", "na", "not applicable"
    ];
    
    specialCases.forEach(text => {
      valueMap[text.toLowerCase()] = "0-1 miles";
    });
    
    return valueMap;
  };

  const valueMap = createValueMap();
  
  return (
    <HorizontalBarChart
      questionId="Q21a"
      title="How far do you live from your main work location?"
      dataField="work_dist"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      valueMap={valueMap}
      labelWidth={200}
      tooltipCountLabel="Responses"
    />
  );
};

export default Q21aVisualization;