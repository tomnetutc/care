import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import './Q5Visualization.scss';
import { useFilters } from '../../context/FilterContext';

interface DataItem {
  life_satisfaction_duringcovid: string;
  count: number;
  percentage: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  data: DataItem | null;
}

const categoryOrder = [
  "Much better now",
  "Somewhat better now",
  "About the same",
  "Somewhat worse now",
  "Much worse now"
];

// Map each category to its color (order matches categoryOrder)
const categoryColors: { [key: string]: string } = {
  "Much better now": "#2ba88c",
  "Somewhat better now": "#93c4b9",
  "About the same": "#ead97c",
  "Somewhat worse now": "#f0b3ba",
  "Much worse now": "#e25b61"
};

const Q5Visualization: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
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
    // eslint-disable-next-line
  }, []);

  // Re-process data when filters change
  useEffect(() => {
    if (rawData.length > 0) {
      processData(rawData);
    }
    // eslint-disable-next-line
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

      // Map numeric values to text descriptions
      const valueMap: { [key: string]: string } = {
        "1": "Much better now",
        "2": "Somewhat better now",
        "3": "About the same",
        "4": "Somewhat worse now",
        "5": "Much worse now"
      };

      // Initialize satisfaction groups with zeros
      const satisfactionGroups: Record<string, number> = {};
      for (const category of categoryOrder) {
        satisfactionGroups[category] = 0;
      }

      // Process the filtered CSV data
      let validResponses = 0;

      filteredData.forEach((d: any) => {
        const rawValue = d.life_satisfaction_duringcovid;

        // Try multiple ways to get the correct satisfaction group
        let group: string | undefined;

        // First check if it's already a text value that matches our categories
        if (categoryOrder.includes(rawValue)) {
          group = rawValue;
        }
        // Then check if it's a numeric value that needs mapping
        else if (valueMap[rawValue]) {
          group = valueMap[rawValue];
        }
        // Finally check if it's another column with a different name
        else {
          // Try alternate column names that might contain the data
          const possibleFields = [
            'life_satisfaction_during_pandemic',
            'life_satisfaction',
            'life_satisfaction_now_group',
            'q5_response',
            'satisfaction_comparison'
          ];

          for (const field of possibleFields) {
            if (d[field] && (categoryOrder.includes(d[field]) || valueMap[d[field]])) {
              group = categoryOrder.includes(d[field]) ? d[field] : valueMap[d[field]];
              break;
            }
          }
        }

        if (group && satisfactionGroups.hasOwnProperty(group)) {
          satisfactionGroups[group]++;
          validResponses++;
        }
      });

      // Convert counts to array of objects with percentages
      const processedData: DataItem[] = categoryOrder.map(category => {
        const count = satisfactionGroups[category] || 0;
        return {
          life_satisfaction_duringcovid: category,
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
              <div className="label">{item.life_satisfaction_duringcovid}</div>
              <div className="bar-container">
                <div
                  className="bar"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: categoryColors[item.life_satisfaction_duringcovid] || "#507dbc"
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

    // Adjust offset values to position tooltip closer to cursor
    const xOffset = 15;
    const yOffset = -30;
    const tooltipStyle: React.CSSProperties = {
      top: `${tooltip.y + yOffset}px`,
      left: `${tooltip.x + xOffset}px`,
      opacity: tooltip.visible ? 1 : 0,
      position: 'absolute', // Ensure absolute positioning
    };

    return (
      <div className="q5-tooltip" style={tooltipStyle}>
        <div className="tooltip-title">{tooltip.data.life_satisfaction_duringcovid}</div>
        <div className="tooltip-content">
          <div>Responses: {tooltip.data.count.toLocaleString()}</div>
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
    <div className="q5-visualization" ref={containerRef}>
      <h2>
        <strong>How would you compare your current satisfaction with your life to your satisfaction with life </strong>
        <strong>during the pandemic</strong>
        <strong>?</strong>
      </h2>
      {renderBarChart()}
      {renderTooltip()}
    </div>
  );
};

export default Q5Visualization;