import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './Q4Visualization.css';
import { useFilters } from '../../context/FilterContext';
interface SummaryStatistic {
  field: string;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  variance: number;
  responses: number;
}

const Q4Visualization: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryStatistic | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  
  // Get filters from context
  const { filters } = useFilters();

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
        
        // Store the raw parsed data
        setRawData(parsedData);
        
        // Process the data with applied filters
        processData(parsedData);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError((err as Error).message);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Add a new effect to reprocess data when filters change
  useEffect(() => {
    if (rawData.length > 0) {
      processData(rawData);
    }
  }, [filters, rawData]);

  const processData = (parsedData: any[]) => {
    if (!parsedData || parsedData.length === 0) {
      setError("No data available");
      setIsLoading(false);
      return;
    }

    // Apply filters
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
    
    // Extract life satisfaction values
    const values: number[] = [];
    let validResponses = 0;
    
    filteredData.forEach(d => {
      const value = parseFloat(d.life_satisfaction_now);
      if (!isNaN(value) && value >= 0 && value <= 10) {
        values.push(value);
        validResponses++;
      }
    });

    if (validResponses === 0) {
      setError("No valid responses found for this question");
      setIsLoading(false);
      return;
    }
    
    // Calculate statistics
    const min = values.length > 0 ? Math.min(...values) : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;
    const mean = validResponses > 0 ? values.reduce((sum, val) => sum + val, 0) / validResponses : 0;
    const variance = validResponses > 0 ? values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validResponses : 0;
    const stdDev = Math.sqrt(variance);
    
    const stats: SummaryStatistic = {
      field: "Thinking about your life as a whole, how satisfied are you? Please rate from 0 to 10, where 0 = not satisfied at all, and 10 = very satisfied.",
      min,
      max,
      mean,
      stdDev,
      variance,
      responses: validResponses
    };
    
    setSummary(stats);
    setIsLoading(false);
    
    // Draw the gauge chart
    if (svgRef.current) {
      drawGaugeChart(mean);
    }
  };

  const drawGaugeChart = (value: number) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 300;
    const margin = { top: 40, right: 30, bottom: 40, left: 30 };
    
    svg
      .attr('width', '100%')
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', `0 0 ${width} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    
    const chartGroup = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height})`);
    
    // Gauge parameters
    const radius = Math.min(width, height * 2) / 2.2;
    const innerRadius = radius * 0.65;
    const outerRadius = radius * 0.85;
    
    // Create scale
    const scale = d3.scaleLinear()
      .domain([0, 10])
      .range([-Math.PI / 2, Math.PI / 2])
      .clamp(true);
    
    // Create arc generators
    const backgroundArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);
    
    // Create gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "gauge-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
      
    // More refined color gradient
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#e74c3c");
      
    gradient.append("stop")
      .attr("offset", "25%")
      .attr("stop-color", "#f39c12");
      
    gradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#f1c40f");
      
    gradient.append("stop")
      .attr("offset", "75%")
      .attr("stop-color", "#2ecc71");
      
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#27ae60");
    
    // Add subtle arc outline
    chartGroup.append("path")
      .attr("class", "gauge-arc")
      .attr("d", backgroundArc as any)
      .style("fill", "url(#gauge-gradient)");
    
    // Create a shadow filter
    const filter = svg.append("defs")
      .append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");
    
    filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3)
      .attr("result", "blur");
      
    filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", 3)
      .attr("result", "offsetBlur");
      
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "offsetBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    
    // Add tick marks
    const tickData = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    chartGroup.selectAll(".tick-line")
      .data(tickData)
      .enter()
      .append("line")
      .attr("class", "tick-line")
      .attr("x1", d => (innerRadius - 2) * Math.cos(scale(d) - Math.PI / 2))
      .attr("y1", d => (innerRadius - 2) * Math.sin(scale(d) - Math.PI / 2))
      .attr("x2", d => (outerRadius + 2) * Math.cos(scale(d) - Math.PI / 2))
      .attr("y2", d => (outerRadius + 2) * Math.sin(scale(d) - Math.PI / 2))
      .style("stroke", d => [0, 5, 10].includes(d) ? "#333" : "#777")
      .style("stroke-width", d => [0, 5, 10].includes(d) ? "2px" : "1px");
    
    // Add tick labels
    chartGroup.selectAll(".tick-label")
      .data([0, 2, 4, 6, 8, 10])  // More tick labels for better reference
      .enter()
      .append("text")
      .attr("class", "tick-label")
      .attr("x", d => (outerRadius + 20) * Math.cos(scale(d as number) - Math.PI / 2))
      .attr("y", d => (outerRadius + 20) * Math.sin(scale(d as number) - Math.PI / 2))
      .attr("text-anchor", d => {
        if (d === 0) return "start";
        if (d === 10) return "end";
        return "middle";
      })
      .attr("dy", d => d === 5 ? "0.4em" : 0)
      .text(d => d);
    
    // Calculate needle position based on value
    const needleLength = outerRadius * 0.95;
    const needleBaseWidth = 8;
    const needleAngle = scale(value);
    
    // Create a needle group
    const needleGroup = chartGroup.append("g")
      .attr("class", "needle");

    // Draw a proper shaped needle (triangle shape)
    const needlePath = needleGroup.append("path")
      .attr("d", `M 0 -3 L ${needleLength} 0 L 0 3 Z`)
      .style("fill", "#484848");
      
    // Add needle cap (circle)
    needleGroup.append("circle")
      .attr("class", "needle-cap")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 8);
      
    // Add value display
    chartGroup.append("text")
      .attr("class", "gauge-value")
      .attr("x", 0)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .style("opacity", 0)
      .text(value.toFixed(2));
      
    chartGroup.append("text")
      .attr("class", "gauge-label")
      .attr("x", 0)
      .attr("y", 70)
      .attr("text-anchor", "middle")
      .style("opacity", 0)
      .text("Life Satisfaction Score");
    
    // More professional animation for needle
    needleGroup
      .style("opacity", 0)
      .attr("transform", `rotate(${-90})`)
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .style("opacity", 1)
      .attr("transform", `rotate(${(needleAngle * 180 / Math.PI) - 90})`);
      
    // Show the value with animation
    chartGroup.selectAll(".gauge-value, .gauge-label")
      .transition()
      .delay(800)
      .duration(800)
      .style("opacity", 1);
  };

  // Add this function for rendering the summary table
  const renderSummaryTable = () => {
    if (!summary) return null;
    
    return (
      <div className="summary-table-container">
        <h3>Summary table</h3>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Min</th>
              <th>Max</th>
              <th>Mean</th>
              <th>Standard Deviation</th>
              <th>Variance</th>
              <th>Responses</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{summary.field}</td>
              <td>{summary.min.toFixed(2)}</td>
              <td>{summary.max.toFixed(2)}</td>
              <td>{summary.mean.toFixed(2)}</td>
              <td>{summary.stdDev.toFixed(2)}</td>
              <td>{summary.variance.toFixed(2)}</td>
              <td>{summary.responses}</td>
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
    <div className="q4-visualization-container">
      <h2><strong>Thinking about your life as a whole, how satisfied are you? Please rate from 0 to 10, where 0 = not satisfied at all, and 10 = very satisfied.</strong></h2>
      <div className="gauge-container">
        <svg ref={svgRef}></svg>
      </div>
      {renderSummaryTable()}
    </div>
  );
};

export default Q4Visualization;