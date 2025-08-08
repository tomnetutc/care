import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q40Visualization: React.FC = () => {
  const categoryOrder = [
    "1",
    "2",
    "3",
    "4",
    "5"
  ];
  const categoryLabels: { [key: string]: string } = {
    "1": "Stand-alone/detached house",
    "2": "Attached home/townhome",
    "3": "Apartment/condo",
    "4": "Mobile home",
    "5": "Other"
  };
  // Custom data processor to handle 'Other' open-ended text
  const dataProcessor = (filteredData: any[], options: any) => {
    const counts: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    let validResponses = 0;
    filteredData.forEach(row => {
      const value = row["hh_unit"];
      if (value === "1" || value === "2" || value === "3" || value === "4") {
        counts[value]++;
        validResponses++;
      } else if (value === "5" || row["hh_unit_other"] || row["40_5_TEXT"]) {
        // If code 5 or any open-ended text is present, count as 'Other'
        counts["5"]++;
        validResponses++;
      }
    });
    return options.categoryOrder.map((cat: string) => ({
      category: cat,
      label: options.categoryLabels[cat] || cat,
      count: counts[cat],
      percentage: validResponses > 0 ? (counts[cat] / validResponses) * 100 : 0
    }));
  };
  return (
    <HorizontalBarChart
      questionId="Q40"
      title="What type of housing do you live in?"
      dataField="hh_unit"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      alternateFields={["40"]}
      dataProcessor={dataProcessor}
      
    />
  );
};

export default Q40Visualization; 