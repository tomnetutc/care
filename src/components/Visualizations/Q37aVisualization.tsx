import React, { useState, useCallback } from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const categoryOrder = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  'Other',
];

const categoryLabels: Record<string, string> = {
  '1': 'Work/school',
  '2': 'Shopping/errands',
  '3': 'Eating/drinking',
  '4': 'Social/recreational',
  '5': 'Access airport',
  '6': 'Medical/dental',
  '7': 'Going/returning home from another location',
  '8': 'Just to enjoy the ride/try the service',
  'Other': 'Other',
};

const valueMap = { '9': 'Other' };

const Q37aVisualization: React.FC = () => {
  const [customTotal, setCustomTotal] = useState<number | undefined>(undefined);

  const dataProcessor = useCallback((filteredData: any[], options: any) => {
    const validRows = filteredData.filter((row: any) => row.transit_trip_purpose && row.transit_trip_purpose !== '-8');
    const counts: Record<string, number> = {};
    for (const cat of options.categoryOrder as string[]) counts[cat] = 0;
    let total = 0;
    validRows.forEach((row: any) => {
      let val = row.transit_trip_purpose;
      if (val === '9') val = 'Other';
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
      questionId="37a"
      title="What was the primary purpose of the trip?"
      dataField="transit_trip_purpose"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      valueMap={valueMap}
      alternateFields={["transit_trip_purpose_other"]}
      
      dataProcessor={dataProcessor}
      customTotalResponses={customTotal}
    />
  );
};

export default Q37aVisualization; 