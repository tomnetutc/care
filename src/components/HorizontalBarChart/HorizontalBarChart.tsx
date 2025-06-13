import React, { useRef, useState } from 'react';
import { useHorizontalBarData, BarDataItem } from '../../hooks/useHorizontalBarData';
import styles from './HorizontalBarChart.module.scss';

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  data: BarDataItem | null;
}

export interface HorizontalBarChartProps {
  questionId: string;
  title: string;
  dataField: string;
  categoryOrder: string[];
  categoryLabels: Record<string, string>;
  categoryColors?: Record<string, string> | string[];
  valueMap?: Record<string, string>;
  alternateFields?: string[];
  labelWidth?: number;
  tooltipTitle?: string;
  tooltipCountLabel?: string;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  questionId,
  title,
  dataField,
  categoryOrder,
  categoryLabels,
  categoryColors,
  valueMap = {},
  alternateFields = [],
  labelWidth = 180,
  tooltipTitle = "Category",
  tooltipCountLabel = "Count"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    data: null
  });

  const { data, isLoading, error, totalResponses } = useHorizontalBarData({
    dataField,
    categoryOrder,
    categoryLabels,
    valueMap,
    alternateFields
  });

  // Determine color for a bar
  const getBarColor = (item: BarDataItem, index: number): string => {
    if (Array.isArray(categoryColors)) {
      return categoryColors[index] || '#507dbc';
    } else if (typeof categoryColors === 'object' && categoryColors !== null) {
      return categoryColors[item.category] || '#507dbc';
    }
    return '#507dbc';
  };

  // Function to render the bar chart visualization
  const renderBarChart = () => {
    // Create a fixed formatter for percentages
    const formatPercent = (value: number) => value.toFixed(1) + '%';
    
    return (
      <div className={styles.chartContainer} style={{ paddingLeft: `${labelWidth}px` }}>
        <div 
          className={styles.gridLines} 
          style={{ inset: `0 0 0 ${labelWidth}px` }}
        >
          {[0, 20, 40, 60, 80, 100].map(value => (
            <div 
              key={value} 
              className={styles.gridLine} 
              style={{ left: `${value}%` }}
            ></div>
          ))}
        </div>
        <div className={styles.barChart}>
          {data.map((item, index) => (
            <div className={styles.barRow} key={index}>
              <div 
                className={styles.label} 
                style={{ width: `${labelWidth}px`, left: `-${labelWidth}px` }}
              >
                {item.label}
              </div>
              <div className={styles.barContainer}>
                <div 
                  className={styles.bar} 
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: getBarColor(item, index)
                  }}
                  onMouseEnter={(e) => showTooltip(e, item)}
                  onMouseLeave={hideTooltip}
                  onMouseMove={(e) => moveTooltip(e)}
                ></div>
                <div className={styles.value}>{formatPercent(item.percentage)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Tooltip handlers
  const showTooltip = (e: React.MouseEvent, item: BarDataItem) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      data: item
    });
  };

  const moveTooltip = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip(prev => ({
      ...prev,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }));
  };

  const hideTooltip = () => {
    setTooltip(prev => ({
      ...prev,
      visible: false
    }));
  };

  // Render tooltip with adjusted positioning
  const renderTooltip = () => {
    if (!tooltip.visible || !tooltip.data) return null;

    const xOffset = 15;
    const yOffset = -30;
    const tooltipStyle: React.CSSProperties = {
      top: `${tooltip.y + yOffset}px`,
      left: `${tooltip.x + xOffset}px`,
      opacity: tooltip.visible ? 1 : 0,
    };

    return (
      <div className={styles.tooltip} style={tooltipStyle}>
        <div className={styles.tooltipTitle}>{tooltip.data.label}</div>
        <div className={styles.tooltipContent}>
          <div>{tooltipCountLabel}: {tooltip.data.count.toLocaleString()}</div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading visualization data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className={styles.horizontalBarChart} ref={containerRef}>
      {title && <h2><strong>{title}</strong></h2>}
      {renderBarChart()}
      {renderTooltip()}
      <div className={styles.totalResponses}>
        Number of respondents: {totalResponses.toLocaleString()}
      </div>
    </div>
  );
};

export default HorizontalBarChart;