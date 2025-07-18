import React, { useState, useCallback } from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const categoryOrder = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Other'
];

const categoryLabels: Record<string, string> = {
  '1': 'Private vehicle, driving alone',
  '2': 'Private vehicle, driving with passengers',
  '3': 'Private vehicle, riding as a passenger',
  '4': 'Carsharing services (e.g., Zipcar)',
  '5': 'Uber/Lyft/other ridehailing services',
  '6': 'Taxi',
  '7': 'Bicycle/E-bike (including bike-sharing services)',
  '8': 'Scooter/E-scooter (including sharing services, e.g., Bird, Lime)',
  '9': 'Walk',
  '10': 'I would not have made this trip',
  'Other': 'Other'
};

const valueMap = { '11': 'Other' };

const Q37bVisualization: React.FC = () => {
  const [customTotal, setCustomTotal] = useState<number | undefined>(undefined);

  const dataProcessor = useCallback((filteredData: any[], options: any) => {
    const validRows = filteredData.filter((row: any) => row.transit_alternative && row.transit_alternative !== '-8');
    const counts: Record<string, number> = {};
    for (const cat of options.categoryOrder as string[]) counts[cat] = 0;
    let total = 0;
    validRows.forEach((row: any) => {
      let val = row.transit_alternative;
      if (val === '11') val = 'Other';
      if ((options.categoryOrder as string[]).includes(val)) {
        counts[val]++;
        total++;
      }
    });
    setCustomTotal(total);
    return (options.categoryOrder as string[]).map((cat: string) => ({
      category: cat,
      label: options.categoryLabels[cat] || cat,
      count: counts[cat],
      percentage: total > 0 ? (counts[cat] / total) * 100 : 0
    }));
  }, []);

  return (
    <HorizontalBarChart
      questionId="37b"
      title="How would you have made this trip if public transit were not available? Please choose the most likely option."
      dataField="transit_alternative"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      valueMap={valueMap}
      labelWidth={300}
      dataProcessor={dataProcessor}
      customTotalResponses={customTotal}
    />
  );
};

export default Q37bVisualization; 