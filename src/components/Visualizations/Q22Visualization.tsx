import React, { useMemo, useState } from 'react';
import { useQ22TransportationData, Q22TransportationRow } from '../../hooks/useQ22TransportationData';
import LikertChart from '../LikertChart/LikertChart';
import styles from '../LikertChart/LikertChart.module.css';

const SEGMENT_KEYS = [
  'Employed – Work',
  'Employed – Non-work',
  'Student – School',
  'Student – Non-work',
  'Student & Worker – Work',
  'Student & Worker – School',
  'Student & Worker – Non-work',
  'Unemployed – Non-work',
];

// Q10-style sequential yellow-brown color palette
const SEGMENT_COLORS = [
  '#e3f0fa', // very light blue
  '#a3d1f7', // lighter blue
  '#7bbcf0', // light-medium blue
  '#4ea3e6', // medium blue
  '#217ecb', // medium-dark blue
  '#1761a7', // deeper blue
  '#23508a', // even deeper blue
  '#3566a4'  // strong medium blue
];

const AGG_KEYS = ['Work', 'Non-Work', 'School'];
const AGG_COLORS = ['#4ea3e6', '#a3d1f7', '#217ecb'];
const AGG_LABELS: Record<string, string> = {
  'Work': 'Work',
  'Non-Work': 'Non-Work',
  'School': 'School',
};

const MODE_ORDER = [
  'Private vehicle, driving alone',
  'Private vehicle, driving with passengers',
  'Private vehicle, riding as a passenger',
  'Carsharing services (e.g., Zipcar)',
  'Bus',
  'Light rail, subway, or other rail',
  'Uber/Lyft/other ridehailing services',
  'Taxi',
  'Bicycle/E-bike (including bike-sharing services)',
  'Scooter/E-scooter (including sharing services)',
  'Walk',
  'Other',
];
const MODE_LABELS: Record<string, string> = {
  'Private vehicle, driving alone': 'Private vehicle, driving alone',
  'Private vehicle, driving with passengers': 'Private vehicle, driving with passengers',
  'Private vehicle, riding as a passenger': 'Private vehicle, riding as a passenger',
  'Carsharing services (e.g., Zipcar)': 'Carsharing services (e.g., Zipcar)',
  'Bus': 'Bus',
  'Light rail, subway, or other rail': 'Light rail, subway, or other rail',
  'Uber/Lyft/other ridehailing services': 'Uber/Lyft/other ridehailing services',
  'Taxi': 'Taxi',
  'Bicycle/E-bike (including bike-sharing services)': 'Bicycle/E-bike (including bike-sharing services)',
  'Scooter/E-scooter (including sharing services)': 'Scooter/E-scooter (including sharing services)',
  'Walk': 'Walk',
  'Other': 'Other',
};

// Aggregation logic
const AGG_MAP: Record<string, string[]> = {
  'Work': [
    'Employed – Work',
    'Student & Worker – Work',
  ],
  'Non-Work': [
    'Employed – Non-work',
    'Student – Non-work',
    'Student & Worker – Non-work',
    'Unemployed – Non-work',
  ],
  'School': [
    'Student – School',
    'Student & Worker – School',
  ],
};

const processQ22Data = (data: Q22TransportationRow[]) =>
  data.map((row) => {
    const total = SEGMENT_KEYS.reduce((sum, key) => sum + (Number(row[key]) || 0), 0);
    return {
      question: row.mode as string,
      values: SEGMENT_KEYS.map((segment) => ({
        category: segment,
        value: total > 0 ? ((Number(row[segment]) || 0) / total) * 100 : 0,
        count: Number(row[segment]) || 0,
      })),
    };
  });

const processQ22Aggregated = (data: Q22TransportationRow[]) =>
  data.map((row) => {
    // Aggregate counts
    const aggCounts: Record<string, number> = {};
    AGG_KEYS.forEach((aggKey) => {
      aggCounts[aggKey] = AGG_MAP[aggKey].reduce((sum, seg) => sum + (Number(row[seg]) || 0), 0);
    });
    const total = AGG_KEYS.reduce((sum, aggKey) => sum + aggCounts[aggKey], 0);
    return {
      question: row.mode as string,
      values: AGG_KEYS.map((aggKey) => ({
        category: aggKey,
        value: total > 0 ? (aggCounts[aggKey] / total) * 100 : 0,
        count: aggCounts[aggKey],
      })),
    };
  });

// Summary counts for below the chart
const getSummaryCounts = (data: Q22TransportationRow[]) => {
  // Sum across all modes for each segment
  const summary: Record<string, number> = {
    Students: 0,
    Workers: 0,
    'Student & Worker': 0,
    Unemployed: 0,
  };
  data.forEach((row) => {
    summary.Students += (Number(row['Student – School']) || 0) + (Number(row['Student – Non-work']) || 0);
    summary.Workers += (Number(row['Employed – Work']) || 0) + (Number(row['Employed – Non-work']) || 0);
    summary['Student & Worker'] += (Number(row['Student & Worker – Work']) || 0) + (Number(row['Student & Worker – School']) || 0) + (Number(row['Student & Worker – Non-work']) || 0);
    summary.Unemployed += Number(row['Unemployed – Non-work']) || 0;
  });
  return summary;
};

const Q22Visualization: React.FC = () => {
  const { data } = useQ22TransportationData();
  const [detailed, setDetailed] = useState(false);

  const dataProcessor = useMemo(() => {
    if (!data) return undefined;
    return detailed ? () => processQ22Data(data) : () => processQ22Aggregated(data);
  }, [data, detailed]);

  const responseCategories = detailed ? SEGMENT_KEYS : AGG_KEYS;
  const categoryColors = detailed ? SEGMENT_COLORS : AGG_COLORS;
  const questionLabels = detailed ? MODE_LABELS : MODE_LABELS;
  const summaryCounts = useMemo(() => (data ? getSummaryCounts(data) : null), [data]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          onClick={() => setDetailed((d) => !d)}
          style={{
            background: '#f5f7fa',
            border: '1px solid #bfc9d1',
            borderRadius: 4,
            padding: '4px 12px',
            fontSize: 13,
            cursor: 'pointer',
            color: '#23508a',
            fontWeight: 600,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            transition: 'background 0.2s',
          }}
        >
          {detailed ? 'Show Summary View' : 'Show Detailed View'}
        </button>
      </div>
      <LikertChart
        questionId="Q22"
        title="Question 22"
        questionOrder={MODE_ORDER}
        questionLabels={questionLabels}
        responseCategories={responseCategories}
        categoryColors={categoryColors}
        dataProcessor={dataProcessor}
        showSummaryTable={false}
        legendWrap={true}
      />
      {/* Summary Box */}
      {!detailed && summaryCounts && (
        <div className={styles.summaryTableContainer} style={{ marginTop: 16, marginBottom: 0, background: '#f5f7fa', borderRadius: 8, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <strong>Respondent Counts:</strong>
          <div style={{ display: 'flex', gap: 24, marginTop: 6, flexWrap: 'wrap' }}>
            <span>Students: <b>{summaryCounts.Students.toLocaleString()}</b></span>
            <span>Workers: <b>{summaryCounts.Workers.toLocaleString()}</b></span>
            <span>Student & Worker: <b>{summaryCounts['Student & Worker'].toLocaleString()}</b></span>
            <span>Unemployed: <b>{summaryCounts.Unemployed.toLocaleString()}</b></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Q22Visualization; 