import React, { useRef, useState } from 'react';
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

  // Tooltip handlers
  const showTooltip = (e: React.MouseEvent, label: string, group: string, value: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      data: { label, group, value }
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
        <div><b>{tooltip.data.group}:</b> {tooltip.data.value.toFixed(1)}%</div>
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

  // Render split-row grouped bar chart, matching HorizontalBarChart style
  const renderBarChart = () => {
    const formatPercent = (value: number) => value.toFixed(1) + '%';
    return (
      <div className={styles.chartContainer} style={{ paddingLeft: `${labelWidth}px` }}>
        <div className={styles.gridLines} style={{ inset: `0 0 0 ${labelWidth}px` }}>
          {[0, 20, 40, 60, 80, 100].map(value => (
            <div key={value} className={styles.gridLine} style={{ left: `${value}%` }}></div>
          ))}
        </div>
        <div className={styles.barChart}>
          {categoryOrder.map((cat, rowIdx) => (
            <div className={styles.barRowStacked} key={cat}>
              <div className={styles.labelStacked} style={{ width: `${labelWidth}px`, left: `-${labelWidth}px` }}>
                {categoryLabels[cat] || cat}
              </div>
              <div className={styles.barStackedGroup}>
                {groupLabels.map((group, groupIdx) => {
                  const value = typeof data[rowIdx]?.[group] === 'number' ? (data[rowIdx][group] as number) : 0;
                  return (
                    <div key={group} className={styles.barWithValueStacked}>
                      <div
                        className={styles.barStacked}
                        style={{
                          width: `${value}%`,
                          backgroundColor: groupColors[groupIdx],
                        }}
                        onMouseEnter={e => showTooltip(e, cat, group, value)}
                        onMouseLeave={hideTooltip}
                        onMouseMove={moveTooltip}
                      ></div>
                      <div className={styles.valueLabelStacked}>{formatPercent(value)}</div>
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
      {title && <h2><strong>{title}</strong></h2>}
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