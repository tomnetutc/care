import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import './Q7Visualization.scss';
import { useFilters } from '../../context/FilterContext';

const barColors = [
  "#e25b61",  // 0: Very Poor
  "#f0b3ba",  // 1: Poor
  "#ead97c",  // 2: Fair
  "#93c4b9",  // 3: Good
  "#2ba88c",  // 4: Very Good
  "#218066"   // 5: Excellent
];

interface DataItem {
  healthcare_quality: string;
  count: number;
  percentage: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  data: DataItem | null;
}

const Q7Visualization: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);  // Store raw data for filtering
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResponses, setTotalResponses] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    data: null
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get filters from context
  const { filters } = useFilters();

  // Load data once on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.PUBLIC_URL}/leaphi_final_data.csv`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const csvText = await response.text();
        const parsedData = d3.csvParse(csvText);
        
        // Store the raw parsed data for filtering later
        setRawData(parsedData);
        
        // Process the data with initial filters
        processData(parsedData);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError((err as Error).message);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Re-process data when filters change
  useEffect(() => {
    if (rawData.length > 0) {
      processData(rawData);
    }
  }, [filters, rawData]);

  // Process data with applied filters
  const processData = (parsedData: any[]) => {
    try {
      // Apply filters to the data
      let filteredData = parsedData;
      
      if (filters.length > 0) {
        filteredData = parsedData.filter(row => {
          // Check if the row passes all filters
          return filters.every(filter => {
            const rowValue = String(row[filter.field]);
            return rowValue === String(filter.value);
          });
        });
      }

      // Define the category order and corresponding labels
      const categoryOrder = ["0", "1", "2", "3", "4", "5"];
      const categoryLabels: {[key: string]: string} = {
        "0": "Very poor",
        "1": "Poor",
        "2": "Fair", 
        "3": "Good",
        "4": "Very Good",
        "5": "Excellent"
      };

      // Initialize healthcare quality rating groups with zeros
      const qualityGroups: Record<string, number> = {};
      for (const category of categoryOrder) {
        qualityGroups[category] = 0;
      }

      // Process the filtered CSV data
      let validResponses = 0;
      
      filteredData.forEach((d: any) => {
        const rawValue = d.healthcare_quality;
        
        if (rawValue && categoryOrder.includes(rawValue)) {
          qualityGroups[rawValue]++;
          validResponses++;
        }
      });
      
      // Convert counts to array of objects with percentages
      const processedData: DataItem[] = categoryOrder.map(category => {
        const count = qualityGroups[category] || 0;
        return {
          healthcare_quality: categoryLabels[category],
          count,
          percentage: validResponses > 0 ? (count / validResponses) * 100 : 0
        };
      });
      
      setData(processedData);
      setTotalResponses(validResponses);
      setIsLoading(false);
      
    } catch (err) {
      console.error('Error processing data:', err);
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  // Function to render the bar chart visualization
  const renderBarChart = () => {
    // Create a fixed formatter for percentages
    const formatPercent = (value: number) => value.toFixed(1) + '%';
    
    return (
      <div className="chart-container">
        <div className="grid-lines">
          {[0, 20, 40, 60, 80, 100].map(value => (
            <div key={value} className="grid-line" style={{ left: `${value}%` }}></div>
          ))}
        </div>
        <div className="bar-chart">
          {data.map((item, index) => (
            <div className="bar-row" key={index}>
              <div className="label">{item.healthcare_quality}</div>
              <div className="bar-container">
                <div 
                  className="bar" 
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: barColors[index] // <-- assign color by index
                  }}
                  onMouseEnter={(e) => showTooltip(e, item)}
                  onMouseLeave={hideTooltip}
                  onMouseMove={(e) => moveTooltip(e)}
                ></div>
                <div className="value">{formatPercent(item.percentage)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  // Tooltip handlers
  const showTooltip = (e: React.MouseEvent, item: DataItem) => {
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
      position: 'absolute',
    };
    return (
      <div className="q7-tooltip" style={tooltipStyle}>
        <div className="tooltip-title">{tooltip.data.healthcare_quality}</div>
        <div className="tooltip-content">
          <div>Count: {tooltip.data.count.toLocaleString()}</div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading visualization data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="q7-visualization" ref={containerRef}>
      <h2><strong>How would you rate your personal access to quality
healthcare? Please rate from 0 to 5, where 0 = very poor, and 5 =
excellent</strong></h2>
      
      {renderBarChart()}
      {renderTooltip()}
    </div>
  );
};

export default Q7Visualization;