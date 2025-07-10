import React from 'react';
import HorizontalGroupedBarChart from '../HorizontalGroupedBarChart/HorizontalGroupedBarChart';
import { useGroupedDistanceData } from '../../hooks/useGroupedDistanceData';

const groupLabels = ['Distance to Work', 'Distance to School'];
const groupColors = ['#507dbc', '#89c4f4'];
const categoryOrder = [
  '0-1 miles',
  '2-5 miles',
  '6-10 miles',
  '11-20 miles',
  '21-50 miles',
  '50+ miles',
];

const Q21CombinedVisualization: React.FC = () => {
  const { data, isLoading, error, labels, workTotal, schoolTotal } = useGroupedDistanceData();

  if (isLoading) {
    return <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading visualization data...</div>;
  }
  if (error) {
    return <div style={{ minHeight: 300, color: '#e25b61', textAlign: 'center' }}>Error loading data: {error}</div>;
  }

  return (
    <HorizontalGroupedBarChart
      data={data}
      groupLabels={groupLabels}
      categoryOrder={categoryOrder}
      categoryLabels={labels}
      groupColors={groupColors}
      title="How far do you live from your main work or school location?"
      summaryString={`Number of workers: ${workTotal.toLocaleString()}, Number of students: ${schoolTotal.toLocaleString()}`}
    />
  );
};

export default Q21CombinedVisualization; 