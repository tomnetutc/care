import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import './Q8Visualization.scss';
import { useFilters } from '../../context/FilterContext';

interface DataItem {
  financial_secure: string;
  count: number;
  percentage: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  data: DataItem | null;
}

const Q8Visualization: React.FC = () => {
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
      const categoryOrder = ["1", "2", "3", "4", "5"];
      const categoryLabels: {[key: string]: string} = {
        "1": "Very secure",
        "2": "Somewhat secure",
        "3": "Neither secure nor insecure", 
        "4": "Somewhat insecure",
        "5": "Very insecure"
      };

      // Initialize financial security groups with zeros
      const securityGroups: Record<string, number> = {};
      for (const category of categoryOrder) {
        securityGroups[category] = 0;
      }

      // Process the filtered CSV data
      let validResponses = 0;
      
      filteredData.forEach((d: any) => {
        const rawValue = d.financial_secure;
        
        if (rawValue && categoryOrder.includes(rawValue)) {
          securityGroups[rawValue]++;
          validResponses++;
        }
      });
      
      // Convert counts to array of objects with percentages
      const processedData: DataItem[] = categoryOrder.map(category => {
        const count = securityGroups[category] || 0;
        return {
          financial_secure: categoryLabels[category],
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

  // Color array for bar segments
  const barColors = [
    "#2ba88c",  // Very secure
    "#93c4b9",  // Somewhat secure
    "#ead97c",  // Neither secure nor insecure
    "#f0b3ba",  // Somewhat insecure
    "#e25b61"   // Very insecure
  ];

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
              <div className="label">{item.financial_secure}</div>
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
      <div className="q8-tooltip" style={tooltipStyle}>
        <div className="tooltip-title">{tooltip.data.financial_secure}</div>
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
    <div className="q8-visualization" ref={containerRef}>
      <h2><strong>How financially secure do you feel, considering your current income, savings, debts, and expenses?</strong></h2>
      
      {renderBarChart()}
      {renderTooltip()}
    </div>
  );
};

export default Q8Visualization;