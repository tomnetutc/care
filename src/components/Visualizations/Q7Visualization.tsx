import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import './Q7Visualization.scss';
import { useFilters } from '../../context/FilterContext';

interface DataItem {
  healthcare_quality: string;
  count: number;
  percentage: number;
}

const Q7Visualization: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);  // Store raw data for filtering
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResponses, setTotalResponses] = useState(0);
  
  // Get filters from context
  const { filters } = useFilters();

  // Load data once on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('./leaphi_final_data.csv');
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
      const categoryOrder = ["-7", "0", "1", "2", "3", "4", "5"];
      const categoryLabels: {[key: string]: string} = {
        "-7": "No response",
        "0": "Very poor",
        "1": "1",
        "2": "2", 
        "3": "3",
        "4": "4",
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
                  style={{ width: `${item.percentage}%`, backgroundColor: '#28a745' }}
                ></div>
                <div className="value">{formatPercent(item.percentage)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Function to render the summary table
  const renderSummaryTable = () => {
    return (
      <div className="summary-table">
        <h3>Summary table</h3>
        <table>
          <thead>
            <tr>
              <th>Healthcare Quality Rating</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.healthcare_quality}</td>
                <td>{item.count.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="total">
              <td>Total</td>
              <td>{totalResponses.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
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
    <div className="q7-visualization">
      <h2><strong>Did any of the following events cause stress or disruption to your life in the past year?</strong></h2>
      
      {renderBarChart()}
      
      {renderSummaryTable()}
      
    </div>
  );
};

export default Q7Visualization;