import React, { useRef, useState } from 'react';
import { PieChart as ReChartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePieChartData, PieDataItem } from '../../hooks/usePieChartData';
import styles from './PieChart.module.scss';

export interface PieChartProps {
  questionId: string;
  title: string;
  dataField: string;
  categoryOrder: string[];
  categoryLabels: Record<string, string>;
  categoryColors?: Record<string, string> | string[];
  valueMap?: Record<string, string>;
  alternateFields?: string[];
  tooltipTitle?: string;
  tooltipCountLabel?: string;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  showLabel?: boolean;
}

const RADIAN = Math.PI / 180;

const PieChart: React.FC<PieChartProps> = ({
  questionId,
  title,
  dataField,
  categoryOrder,
  categoryLabels,
  categoryColors,
  valueMap = {},
  alternateFields = [],
  tooltipTitle = "Category",
  tooltipCountLabel = "Count",
  innerRadius = 0,
  outerRadius = "80%", // Changed from 170 to "80%"
  showLegend = true,
  showLabel = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data, isLoading, error, totalResponses } = usePieChartData({
    dataField,
    categoryOrder,
    categoryLabels,
    valueMap,
    alternateFields
  });
  
  // Determine color for a pie slice
  const getSliceColor = (item: PieDataItem, index: number): string => {
    if (Array.isArray(categoryColors)) {
      return categoryColors[index] || '#507dbc';
    } else if (typeof categoryColors === 'object' && categoryColors !== null) {
      return categoryColors[item.name] || '#507dbc';
    }
    return '#507dbc';
  };
  
  // Custom label renderer - directly on the pie slice
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    if (!showLabel || percent < 0.05) return null;
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#fff"
        textAnchor="middle" 
        dominantBaseline="central"
        className={styles.pieLabel}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{data.label}</p>
          <p className={styles.tooltipValue}>{`${data.value.toFixed(1)}%`}</p>
          <p className={styles.tooltipCount}>{`${tooltipCountLabel}: ${data.count}`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend component similar to LikertChart
  const renderCustomLegend = () => {
    if (!showLegend) return null;
    
    return (
      <div className={styles.legendContainer}>
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className={styles.legendItem}>
            <div 
              className={styles.legendColor} 
              style={{ backgroundColor: getSliceColor(entry, index) }}
            />
            <span className={styles.legendText}>{entry.label}</span>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.pieChartContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading visualization data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pieChartContainer}>
        <div className={styles.errorContainer}>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pieChartContainer} ref={containerRef}>
      <h2><strong>{title}</strong></h2>
      <div className={styles.chartContent}>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={400}>
            <ReChartsPie>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius="80%"
                innerRadius={innerRadius}
                fill="#8884d8"
                dataKey="value"
                nameKey="label"
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getSliceColor(entry, index)}
                    className={styles.pieSlice}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </ReChartsPie>
          </ResponsiveContainer>
        </div>
        {renderCustomLegend()}
      </div>
      <div className={styles.totalResponses}>
        Number of respondents: {totalResponses.toLocaleString()}
      </div>
    </div>
  );
};

export default PieChart;