import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q31Visualization: React.FC = () => {
  const categoryOrder = [
    "Bus",
    "Light rail, subway, or other local/regional rail",
    "Intercity rail (e.g., Amtrak)",
    "Ferry",
    "Other",
    "None"
  ];
  
  const categoryLabels: { [key: string]: string } = {
    "Bus": "Bus",
    "Light rail, subway, or other local/regional rail": "Light rail, subway, or other local/regional rail",
    "Intercity rail (e.g., Amtrak)": "Intercity rail (e.g., Amtrak)",
    "Ferry": "Ferry",
    "Other": "Other",
    "None": "None"
  };
  
  const categoryColors = [
    "#2ba88c",  // Bus
    "#93c4b9",  // Light rail, subway, or other local/regional rail
    "#ead97c",  // Intercity rail (e.g., Amtrak)
    "#f0b3ba",  // Ferry
    "#e25b61",  // Other
    "#218066"   // None
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q31"
      title="Which of the following modes of public transit are available where you live? Please select all that you are aware of."
      dataField="ta_bus"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      multiSelectFields={{
        ta_bus: "Bus",
        ta_light_rail: "Light rail, subway, or other local/regional rail",
        ta_intercity_rail: "Intercity rail (e.g., Amtrak)",
        ta_ferry: "Ferry",
        ta_none: "None",
        transit_avail_other: "Other"
      }}
      tooltipCountLabel="Responses"
    />
  );
};

export default Q31Visualization; 