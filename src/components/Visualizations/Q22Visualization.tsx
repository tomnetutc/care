import React, { useMemo } from 'react';
import { useQ22TransportationData, Q22TransportationRow } from '../../hooks/useQ22TransportationData';
import HorizontalGroupedBarChart from '../HorizontalGroupedBarChart/HorizontalGroupedBarChart';

const AGG_KEYS = ['Work', 'Non-Work', 'School'];
const AGG_COLORS = ['#4ea3e6', '#a3d1f7', '#217ecb'];

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

const AGG_MAP: Record<string, string[]> = {
  'Work': ['Employed – Work', 'Student & Worker – Work'],
  'Non-Work': [
    'Employed – Non-work',
    'Student – Non-work',
    'Student & Worker – Non-work',
    'Unemployed – Non-work',
  ],
  'School': ['Student – School', 'Student & Worker – School'],
};

const processQ22Data = (data: Q22TransportationRow[]) => {
  const groupTotals: Record<string, number> = {};
  AGG_KEYS.forEach((aggKey) => {
    groupTotals[aggKey] = data.reduce((sum, row) => {
      const groupCount = AGG_MAP[aggKey].reduce((groupSum, seg) => groupSum + (Number(row[seg]) || 0), 0);
      return sum + groupCount;
    }, 0);
  });

  return data.map((row) => {
    const aggCounts: Record<string, number> = {};
    AGG_KEYS.forEach((aggKey) => {
      aggCounts[aggKey] = AGG_MAP[aggKey].reduce((sum, seg) => sum + (Number(row[seg]) || 0), 0);
    });

    return {
      label: row.mode as string,
      Work: groupTotals['Work'] > 0 ? (aggCounts['Work'] / groupTotals['Work']) * 100 : 0,
      'Non-Work': groupTotals['Non-Work'] > 0 ? (aggCounts['Non-Work'] / groupTotals['Non-Work']) * 100 : 0,
      School: groupTotals['School'] > 0 ? (aggCounts['School'] / groupTotals['School']) * 100 : 0,
      Work_count: aggCounts['Work'],
      'Non-Work_count': aggCounts['Non-Work'],
      School_count: aggCounts['School'],
    };
  });
};

const getSummaryCounts = (rawData: any[]) => {
  const hasValid = (cols: string[], row: any) => cols.some(col => [1,2,3,4,5,6,7,8,9,10,11,12].includes(Number(row[col])));

  const studentWorker = rawData.filter(row =>
    hasValid(['work_mode_choice_student_worker', 'school_mode_choice_student_worker', 'nonwork_mode_choice_student_worker'], row)
  );

  const student = rawData.filter(row =>
    hasValid(['school_mode_choice_student', 'nonwork_mode_choice_student'], row) &&
    !studentWorker.includes(row)
  );

  const worker = rawData.filter(row =>
    hasValid(['work_mode_choice', 'nonwork_mode_choice'], row) &&
    !studentWorker.includes(row) &&
    !student.includes(row)
  );

  const unemployed = rawData.filter(row =>
    hasValid(['nonwork_mode_choice_nonemp'], row) &&
    !studentWorker.includes(row) &&
    !student.includes(row) &&
    !worker.includes(row)
  );

  return {
    Students: student.length,
    Workers: worker.length,
    'Student & Worker': studentWorker.length,
    'Non-Workers': unemployed.length
  };
};

const Q22Visualization: React.FC = () => {
  const { data, rawData } = useQ22TransportationData();

  const chartData = useMemo(() => processQ22Data(data), [data]);
  const exclusiveSummary = useMemo(() => getSummaryCounts(rawData), [rawData]);

  return (
    <div>
      <HorizontalGroupedBarChart
        data={chartData}
        groupLabels={AGG_KEYS}
        categoryOrder={MODE_ORDER}
        categoryLabels={MODE_LABELS}
        groupColors={AGG_COLORS}
        title="Transportation Choices"
        summaryString={
          'Students: ' + (exclusiveSummary?.Students?.toLocaleString() ?? '') +
          ', Workers: ' + (exclusiveSummary?.Workers?.toLocaleString() ?? '') +
          ', Student & Worker: ' + (exclusiveSummary?.['Student & Worker']?.toLocaleString() ?? '') +
          ', Non-Workers: ' + (exclusiveSummary?.['Non-Workers']?.toLocaleString() ?? '')
        }
        
      />
    </div>
  );
};

export default Q22Visualization;