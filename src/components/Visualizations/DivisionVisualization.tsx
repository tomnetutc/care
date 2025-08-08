import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const DivisionVisualization: React.FC = () => {
  const categoryOrder = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  const categoryLabels: {[key: string]: string} = {
    '1': 'New England',
    '2': 'Middle Atlantic',
    '3': 'East North Central',
    '4': 'West North Central',
    '5': 'South Atlantic',
    '6': 'East South Central',
    '7': 'West South Central',
    '8': 'Mountain',
    '9': 'Pacific'
  };
  
  const categoryColors = [
    '#507dbc', // New England
    '#507dbc', // Middle Atlantic
    '#507dbc', // East North Central
    '#507dbc', // West North Central
    '#507dbc', // South Atlantic
    '#507dbc', // East South Central
    '#507dbc', // West South Central
    '#507dbc', // Mountain
    '#507dbc', // Pacific
  ];

  // Custom data processor to handle region data
  const dataProcessor = (filteredData: any[], options: any) => {
    const categoryGroups: Record<string, number> = {
      '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0
    };

    let validResponses = 0;

    filteredData.forEach((row: any) => {
      const divisionValue = row.division;
      
      // Handle different possible formats
      let category: string | undefined;
      
      if (divisionValue !== null && divisionValue !== undefined && divisionValue !== '' && divisionValue !== '-8') {
        // Convert to string and trim
        const cleanValue = String(divisionValue).trim();
        
        // Check if it's a valid division code
        if (options.categoryOrder.includes(cleanValue)) {
          category = cleanValue;
          validResponses++;
        }
      }
      
      if (category && categoryGroups.hasOwnProperty(category)) {
        categoryGroups[category]++;
      }
    });

    // Convert to array format
    return options.categoryOrder.map((category: string) => ({
      category,
      label: options.categoryLabels[category] || category,
      count: categoryGroups[category] || 0,
      percentage: validResponses > 0 ? (categoryGroups[category] || 0) / validResponses * 100 : 0
    }));
  };

  return (
    <HorizontalBarChart
      questionId="Division"
      title="Geographic Division"
      dataField="division"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      dataProcessor={dataProcessor}
    />
  );
};

export default DivisionVisualization; 