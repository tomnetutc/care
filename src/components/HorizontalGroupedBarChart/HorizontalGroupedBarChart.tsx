import React, { useRef, useState, useMemo } from 'react';
import { chartDataToCSV, downloadCSV } from '../../utils/csvUtils';
import DownloadButton from '../DownloadButton/DownloadButton';
import { useCurrentTopicLabel } from '../../hooks/useCurrentTopicLabel';
import styles from './HorizontalGroupedBarChart.module.scss';

export interface GroupedBarDataItem {
  label: string;
  [key: string]: string | number;
}

export interface HorizontalGroupedBarChartProps {
  data: GroupedBarDataItem[];
  groupLabels: string[]; // e.g., ["Distance to Work", "Distance to School"]
  categoryOrder: string[];
  categoryLabels: Record<string, string>;
  groupColors: string[];
  labelWidth?: number;
  title?: string;
  summaryString?: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  data: { label: string; group: string; value: number } | null;
}

const HorizontalGroupedBarChart: React.FC<HorizontalGroupedBarChartProps> = ({
  data,
  groupLabels,
  categoryOrder,
  categoryLabels,
  groupColors,
  labelWidth = 180,
  title,
  summaryString
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    data: null
  });

  const topicLabel = useCurrentTopicLabel(title);

  // Tooltip handlers
  const showTooltip = (e: React.MouseEvent, label: string, group: string, value: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Find the count for this group/category from the data array
    const row = data.find(d => d.label === label);
    let count = 0;
    if (row && typeof row[`${group}_count`] === 'number') {
      count = row[`${group}_count`] as number;
    } else if (row && typeof row[`${group}Count`] === 'number') {
      count = row[`${group}Count`] as number;
    } else if (row && typeof row[group] === 'number') {
      // fallback: if only percentage is present, can't show count
      count = NaN;
    }
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      data: { label, group, value: count }
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

  // Transform data for CSV export
  const transformedData = useMemo(() => {
    return data.map((item) => {
      const obj: { [key: string]: string | number } = {
        name: item.label,
        ...groupLabels.reduce((acc, group) => {
          const value = item[group];
          acc[group] = typeof value === 'number' ? value : 0;
          return acc;
        }, {} as { [key: string]: number })
      };
      return obj;
    });
  }, [data, groupLabels]);

  // Download CSV handler
  const handleDownload = () => {
    const csv = chartDataToCSV(
      transformedData,
      groupLabels.map(group => ({ label: group }))
    );
    const filename = `${topicLabel}.csv`;
    downloadCSV(csv, filename);
  };

  // Render tooltip
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
        <div className={styles.tooltipTitle}>{categoryLabels[tooltip.data.label] || tooltip.data.label}</div>
        <div>n = {isNaN(tooltip.data.value) ? 'N/A' : tooltip.data.value.toLocaleString()}</div>
      </div>
    );
  };

  // Render legend
  const renderLegend = () => (
    <div className={styles.legendGroup}>
      {groupLabels.map((group, idx) => (
        <div key={group} className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: groupColors[idx] }} />
          <span>{group}</span>
        </div>
      ))}
    </div>
  );

  // Add a reusable component for per-group gridlines
  const GroupGridLines: React.FC = () => (
    <div className={styles.groupGridLines} aria-hidden="true">
      {[0, 20, 40, 60, 80, 100].map((val) => (
        <div
          key={val}
          className={styles.groupGridLine}
          style={{ left: `${val}%` }}
        />
      ))}
    </div>
  );

  // Render side-by-side grouped bar chart, matching HorizontalBarChart style
  const renderBarChart = () => {
    const formatPercent = (value: number) => value.toFixed(1) + '%';
    return (
      <div className={styles.chartContainer} style={{ paddingLeft: `${labelWidth}px` }}>
        <div className={styles.barChart}>
          {categoryOrder.map((cat, rowIdx) => (
            <div className={styles.barRow} key={cat}>
              <div className={styles.label} style={{ width: `${labelWidth}px`, left: `-${labelWidth}px` }}>
                {categoryLabels[cat] || cat}
              </div>
              <div className={styles.barGroupContainer}>
                {groupLabels.map((group, groupIdx) => {
                  const value = typeof data[rowIdx]?.[group] === 'number' ? (data[rowIdx][group] as number) : 0;
                  return (
                    <div key={group} className={styles.barGroupWithGrid}>
                      <GroupGridLines />
                      <div className={styles.barContainer}>
                        <div
                          className={styles.bar}
                          style={{
                            width: `${value}%`,
                            backgroundColor: groupColors[groupIdx],
                          }}
                          onMouseEnter={e => showTooltip(e, cat, group, value)}
                          onMouseLeave={hideTooltip}
                          onMouseMove={moveTooltip}
                        ></div>
                        <div className={styles.value}>{formatPercent(value)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.horizontalGroupedBarChart} ref={containerRef}>
      {title && (
        <div className={styles.titleContainer}>
          <h2><strong>{title}</strong></h2>
          <DownloadButton onClick={handleDownload} />
        </div>
      )}
      {renderLegend()}
      {renderBarChart()}
      {renderTooltip()}
      {summaryString && (
        <div className={styles.summaryString}>{summaryString}</div>
      )}
    </div>
  );
};

export default HorizontalGroupedBarChart; 