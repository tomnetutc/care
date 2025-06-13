import React from 'react';
import GaugeChart from '../GaugeChart/GaugeChart';

const Q4Visualization: React.FC = () => {
  return (
    <GaugeChart
      title="Thinking about your life as a whole, how satisfied are you? Please rate from 0 to 10, where 0 = not satisfied at all, and 10 = very satisfied."
      dataField="life_satisfaction_now"
      minValue={0}
      maxValue={10}
      colorStops={[
        { offset: "0%", color: "#e25b61" },    // Strong red
        { offset: "25%", color: "#f0b3ba" },   // Light red
        { offset: "50%", color: "#ead97c" },   // Yellow
        { offset: "75%", color: "#93c4b9" },   // Light green
        { offset: "100%", color: "#2ba88c" },  // Strong green
      ]}
      showSummaryTable={true}
    />
  );
};

export default Q4Visualization;