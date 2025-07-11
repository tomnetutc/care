import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q33Visualization: React.FC = () => {
  const categoryOrder = [
    "Bus",
    "Light rail, subway, or other local/regional rail",
    "Intercity rail (e.g., Amtrak)",
    "Ferry",
    "Other"
  ];
  
  const categoryLabels: { [key: string]: string } = {
    "Bus": "Bus",
    "Light rail, subway, or other local/regional rail": "Light rail, subway, or other local/regional rail",
    "Intercity rail (e.g., Amtrak)": "Intercity rail (e.g., Amtrak)",
    "Ferry": "Ferry",
    "Other": "Other, please specify:"
  };
  
  const categoryColors = [
    "#507dbc",  // Bus
    "#507dbc",  // Light rail
    "#507dbc",  // Intercity rail
    "#507dbc",  // Ferry
    "#507dbc"   // Other
  ];

  return (
    <HorizontalBarChart
      questionId="Q33"
      title="Which of the following modes of public transit do you use regularly (at least once a month)? Please select all that apply."
      dataField="tmu_bus"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      multiSelectFields={{
        tmu_bus: "Bus",
        tmu_light_rail: "Light rail, subway, or other local/regional rail",
        tmu_intercity_rail: "Intercity rail (e.g., Amtrak)",
        tmu_ferry: "Ferry",
        transit_mode_use_other: "Other"
      }}
      tooltipCountLabel="Responses"
      percentageDenominator="totalSelections"
    />
  );
};

export default Q33Visualization; 