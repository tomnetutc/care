import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q21bVisualization: React.FC = () => {
  // Define distance categories in logical order (same as work distance)
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
    "#218066",  // 0-1 miles - excellent (darkest green)
    "#2ba88c",  // 2-5 miles - very good (green)
    "#93c4b9",  // 6-10 miles - good (light green)
    "#ead97c",  // 11-20 miles - fair (yellow)
    "#f0b3ba",  // 21-50 miles - poor (light red)
    "#e25b61"   // 50+ miles - very poor (red)
  ];
  
  // Create comprehensive value mapping for numeric distances
  const createValueMap = (): Record<string, string> => {
    const valueMap: Record<string, string> = {};
    
    // Handle numeric values explicitly
    for (let i = 0; i <= 100; i++) {
      const distance = i.toString();
      if (i <= 1) {
        valueMap[distance] = "0-1 miles";
      } else if (i <= 5) {
        valueMap[distance] = "2-5 miles";
      } else if (i <= 10) {
        valueMap[distance] = "6-10 miles";
      } else if (i <= 20) {
        valueMap[distance] = "11-20 miles";
      } else if (i <= 50) {
        valueMap[distance] = "21-50 miles";
      } else {
        valueMap[distance] = "50+ miles";
      }
    }
    
    // Handle decimal values that might exist
    const decimalDistances = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5];
    decimalDistances.forEach(dist => {
      const distance = dist.toString();
      if (dist <= 1) {
        valueMap[distance] = "0-1 miles";
      } else if (dist <= 5) {
        valueMap[distance] = "2-5 miles";
      } else if (dist <= 10) {
        valueMap[distance] = "6-10 miles";
      }
    });
    
    // Handle special text cases that might exist in the data
    const specialCases = [
      "online", "virtual", "remote", "distance learning", "home school", "homeschool",
      "n/a", "na", "not applicable", "0", "zero"
    ];
    
    specialCases.forEach(text => {
      valueMap[text.toLowerCase()] = "0-1 miles";
    });
    
    return valueMap;
  };

  const valueMap = createValueMap();
  
  return (
    <HorizontalBarChart
      questionId="Q21b"
      title="How far do you live from your main school location?"
      dataField="school_dist"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      valueMap={valueMap}
      labelWidth={200}
      tooltipCountLabel="Responses"
    />
  );
};

export default Q21bVisualization;