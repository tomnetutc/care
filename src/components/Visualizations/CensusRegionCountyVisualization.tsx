import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const CensusRegionCountyVisualization: React.FC = () => {
  const categoryOrder = ['1', '2', '3', '4', '5', '6'];
  
  const categoryLabels: {[key: string]: string} = {
    '1': 'Maricopa County',
    '2': 'Puget Sound Region',
    '3': 'Northeast',
    '4': 'Midwest',
    '5': 'South',
    '6': 'West*'
  };
  
  const categoryColors = [
    '#507dbc', // Maricopa
    '#507dbc', // Puget
    '#507dbc', // Northeast
    '#507dbc', // Midwest
    '#507dbc', // South
    '#507dbc', // West* (excluding Maricopa and Puget)
  ];

  // Custom data processor to map region data to census regions
  const dataProcessor = (filteredData: any[], options: any) => {
    const categoryGroups: Record<string, number> = {
      '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0
    };

    let validResponses = 0;

    // Mapping from region codes to census region codes
    // This mapping needs to be adjusted based on the actual geographic distribution
    const regionToCensusMap: Record<string, string> = {
      '1': '1', // New England -> Maricopa (assuming this is the mapping)
      '2': '2', // Middle Atlantic -> Puget
      '3': '3', // East North Central -> Northeast
      '4': '4', // West North Central -> Midwest
      '5': '5', // South Atlantic -> South
      '6': '6', // East South Central -> West* (excluding Maricopa and Puget)
      '7': '6', // West South Central -> West* (excluding Maricopa and Puget)
      '8': '6', // Mountain -> West* (excluding Maricopa and Puget)
      '9': '6', // Pacific -> West* (excluding Maricopa and Puget)
    };

    filteredData.forEach((row: any) => {
      const countyRegionValue = row.county_region;
      
      // Handle different possible formats
      let category: string | undefined;
      
      if (countyRegionValue !== null && countyRegionValue !== undefined && countyRegionValue !== '' && countyRegionValue !== '-8' && countyRegionValue !== '0') {
        // Convert to string and trim
        const cleanValue = String(countyRegionValue).trim();
        
        // Map county_region to census region
        if (regionToCensusMap[cleanValue]) {
          category = regionToCensusMap[cleanValue];
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
      questionId="CensusRegionCounty"
      title="Census Region/County"
      dataField="county_region"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      dataProcessor={dataProcessor}
      categoryNotes={{
        '6': '(*) Excluding Maricopa County and Puget Sound County'
      }}
    />
  );
};

export default CensusRegionCountyVisualization; 