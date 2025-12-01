/**
 * Scenario ATE Chart Component - Clean and Organized Design
 * 
 * Displays Average Treatment Effects (ATEs) as horizontal diverging bars.
 * Shows ΔLess (left/red), ΔSame (gray center), ΔMore (right/green) for each activity.
 */

import React, { useRef, useState, useMemo } from 'react';
import { ATEResult } from '../lib/engine/computeATE';
import styles from './ScenarioATEChart.module.scss';

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  data: ATEResult | null;
}

export interface ScenarioATEChartProps {
  results: ATEResult[];
  title?: string;
  showDebugInfo?: boolean;
  anticipatedChange?: 'do_less' | 'about_same' | 'do_more' | null;
}

const ScenarioATEChart: React.FC<ScenarioATEChartProps> = ({
  results,
  title = "Average Treatment Effects (ATEs)",
  showDebugInfo = false,
  anticipatedChange = 'do_more'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    data: null
  });

  // Filter out invalid results
  const validResults = useMemo(() => {
    return results.filter(result => result.isValid && result.ate.length > 0);
  }, [results]);

  // Calculate max absolute ATE for scaling
  const maxATE = useMemo(() => {
    if (validResults.length === 0) return 0.1;
    
    let max = 0;
    validResults.forEach(result => {
      result.ate.forEach(ate => {
        max = Math.max(max, Math.abs(ate));
      });
    });
    
    return Math.max(max, 0.1); // Ensure minimum scale
  }, [validResults]);

  // Use a dynamic scale so large values do not visually overwhelm the chart
  const dynamicScale = useMemo(() => {
    const base = maxATE || 0.1;
    // Give the largest bar a little headroom while keeping a sensible minimum/maximum
    return Math.min(Math.max(base * 1.15, 0.12), 0.25);
  }, [maxATE]);

  // Format ATE value for display
  const formatATE = (value: number): string => {
    return value >= 0 ? `+${value.toFixed(3)}` : value.toFixed(3);
  };

  // Clean activity labels
  const activityLabels: Record<string, string> = {
    'use_transit': 'Use Transit',
    'use_car': 'Use Car',
    'stay_home': 'Stay at Home',
    'dine_in_pickup': 'Dine In / Pick up',
    'get_meal_delivered': 'Get Meal Delivered',
    'work_from_home': 'Work from Home',
    'work_from_office': 'Work from Office',
    'go_business_as_usual': 'Go Business as Usual'
  };

  // Tooltip functions
  const showTooltip = (event: React.MouseEvent, data: ATEResult) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      data
    });
  };

  const hideTooltip = () => {
    setTooltip({
      visible: false,
      x: 0,
      y: 0,
      data: null
    });
  };

  const moveTooltip = (event: React.MouseEvent) => {
    if (tooltip.visible) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltip(prev => ({
        ...prev,
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      }));
    }
  };

  // Render tooltip
  const renderTooltip = () => {
    if (!tooltip.visible || !tooltip.data) return null;

    const { activity, ate, levelLabels } = tooltip.data;
    
    return (
      <div 
        className={styles.tooltip}
        style={{
          left: tooltip.x,
          top: tooltip.y,
          transform: 'translateX(-50%)'
        }}
      >
        <div className={styles.tooltipTitle}>
          {activityLabels[activity] || activity}
        </div>
        <div className={styles.tooltipContent}>
          {ate.map((value, index) => (
            <div key={index} className={styles.tooltipRow}>
              <span className={styles.tooltipLabel}>{levelLabels[index]}:</span>
              <span className={styles.tooltipValue}>{formatATE(value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render single activity bar
  const renderActivityBar = (result: ATEResult, index: number) => {
    const { activity, ate } = result;
    
    return (
      <div 
        key={activity}
        className={styles.activityRow}
        onMouseEnter={(e) => showTooltip(e, result)}
        onMouseLeave={hideTooltip}
        onMouseMove={(e) => moveTooltip(e)}
      >
        <div className={styles.activityLabel}>
          {activityLabels[activity] || activity}
        </div>
        
        <div className={styles.barContainer}>
          <div className={styles.barBackground}>
            {/* Center line */}
            <div className={styles.centerLine}></div>
            
            {/* Show the ATE value for the selected anticipated change */}
            {(() => {
                  // Map anticipated change to ATE index
                  // For 3-level models: do_less=0, about_same=1, do_more=2
                  // For 5-level models (before aggregation): do_less=0, about_same=2, do_more=4
                  // For 2-level models (GBU aggregated): do_less=0 (Unlikely), do_more=1 (Likely)
                  let ateIndex = 0;
                  if (anticipatedChange === 'do_less') {
                    ateIndex = 0;
                  } else if (anticipatedChange === 'about_same') {
                    // For 3-level models, index 1; for 5-level models, index 2 (Neutral); for 2-level, use 0
                    if (ate.length === 2) {
                      ateIndex = 0; // For GBU aggregated, "about same" maps to "Unlikely"
                    } else if (ate.length === 3) {
                      ateIndex = 1;
                    } else if (ate.length === 5) {
                      ateIndex = 2;
                    } else {
                      ateIndex = 1;
                    }
                  } else if (anticipatedChange === 'do_more') {
                    // For 3-level models, index 2; for 5-level models, index 4; for 2-level, index 1
                    if (ate.length === 2) {
                      ateIndex = 1; // For GBU aggregated, "do more" maps to "Likely"
                    } else if (ate.length === 3) {
                      ateIndex = 2;
                    } else if (ate.length === 5) {
                      ateIndex = 4;
                    } else {
                      ateIndex = ate.length - 1;
                    }
                  }
                  
                  // Ensure index is valid
                  if (ateIndex >= ate.length) {
                    ateIndex = ate.length - 1;
                  }
                  
                  const selectedATE = ate[ateIndex];
                  const absValue = Math.abs(selectedATE);
              
              // Scale bar width relative to the dynamic maximum so extremely large values
              // do not consume the entire row
              const scale = dynamicScale || 0.12;
              const relativeWidth = Math.min(absValue / scale, 1);
              const barPercent = Math.max(relativeWidth * 40, 3); // cap at 40% of row
              const left = selectedATE >= 0 ? 50 : 50 - barPercent;
              
              // Color based on the effect direction
              const color = selectedATE >= 0 ? '#10b981' : '#ef4444'; // Green for positive, Red for negative
              
              return (
                <div
                  className={styles.netBar}
                  style={{
                    left: `${left}%`,
                    width: `${barPercent}%`,
                    backgroundColor: color,
                    opacity: absValue > 0.001 ? 0.9 : 0.3
                  }}
                >
                  <div className={styles.netValue}>
                    {absValue > 0.001 ? formatATE(selectedATE) : ''}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

  // Render legend
  const renderLegend = () => {
    if (validResults.length === 0) return null;
    
    return (
      <div className={styles.legend}>
        <div className={styles.legendTitle}>
          {anticipatedChange === 'do_less' ? 'Do Less' : 
           anticipatedChange === 'about_same' ? 'About the Same' : 
           anticipatedChange === 'do_more' ? 'Do More' : 'Largest Effect'}:
        </div>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <div 
              className={styles.legendColor}
              style={{ backgroundColor: '#ef4444' }}
            ></div>
            <span>Decrease in Activity</span>
          </div>
          <div className={styles.legendItem}>
            <div 
              className={styles.legendColor}
              style={{ backgroundColor: '#10b981' }}
            ></div>
            <span>Increase in Activity</span>
          </div>
        </div>
        <div className={styles.legendNote}>
          Shows the ATE for "{anticipatedChange === 'do_less' ? 'Do Less' : 
           anticipatedChange === 'about_same' ? 'About the Same' : 
           anticipatedChange === 'do_more' ? 'Do More' : 'selected'}" behavioral change for each activity
        </div>
      </div>
    );
  };

  // Render debug info
  const renderDebugInfo = () => {
    if (!showDebugInfo || validResults.length === 0) return null;
    
    return (
      <div className={styles.debugInfo}>
        <h4>Debug Information:</h4>
        <div className={styles.debugStats}>
          <div>Max ATE: {maxATE.toFixed(3)}</div>
          <div>Valid Results: {validResults.length}</div>
          <div>Total Results: {results.length}</div>
        </div>
        <div className={styles.debugResults}>
          {validResults.map((result, index) => (
            <div key={result.activity} className={styles.debugResult}>
              <strong>{result.activity}:</strong>
              <div>ATE: [{result.ate.map(v => v.toFixed(3)).join(', ')}]</div>
              <div>Conservation: {result.conservationCheck.toFixed(6)}</div>
              <div>Valid: {result.isValid ? 'Yes' : 'No'}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Debug logging
  console.log('ScenarioATEChart Debug:', {
    totalResults: results.length,
    validResults: validResults.length,
    maxATE,
    results: results.map(r => ({
      activity: r.activity,
      ate: r.ate,
      isValid: r.isValid
    }))
  });

  if (validResults.length === 0) {
    return (
      <div className={styles.noDataContainer}>
        <div className={styles.noDataIcon}>📊</div>
        <h3>No ATE Results Available</h3>
        <p>Please compute ATE values first by selecting a scenario and clicking "Compute ATE".</p>
        {results.length > 0 && (
          <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
            <strong>Debug Info:</strong>
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.chartContainer} ref={containerRef}>
      {/* Header */}
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>{title}</h3>
        <p className={styles.chartSubtitle}>
          Impact of extreme heat on behavioral changes
        </p>
      </div>

      {/* Legend */}
      {renderLegend()}

      {/* Chart */}
      <div className={styles.chart}>
        <div className={styles.chartContent}>
          {validResults.map((result, index) => renderActivityBar(result, index))}
        </div>
      </div>

      {/* Tooltip */}
      {renderTooltip()}

      {/* Debug Info */}
      {renderDebugInfo()}
    </div>
  );
};

export default ScenarioATEChart;