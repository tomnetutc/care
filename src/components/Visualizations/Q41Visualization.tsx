import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q41Visualization: React.FC = () => {
  const categoryOrder = [
    "1",
    "2",
    "3"
  ];
  const categoryLabels: { [key: string]: string } = {
    "1": "Rent",
    "2": "Own",
    "3": "Other"
  };
  // Custom data processor to handle 'Other' open-ended text
  const dataProcessor = (filteredData: any[], options: any) => {
    const counts: Record<string, number> = { "1": 0, "2": 0, "3": 0 };
    let validResponses = 0;
    filteredData.forEach(row => {
      const value = row["hh_tenure"];
      if (value === "1" || value === "2") {
        counts[value]++;
        validResponses++;
      } else if (value === "3" || row["hh_tenure_other"] || row["41_3_TEXT"]) {
        // If code 3 or any open-ended text is present, count as 'Other'
        counts["3"]++;
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
      questionId="Q41"
      title="Do you rent or own your home?"
      dataField="hh_tenure"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      alternateFields={["41"]}
      dataProcessor={dataProcessor}
      
    />
  );
};

export default Q41Visualization; 