import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import styles from './GaugeChart.module.scss';
import { useGaugeData, SummaryStatistic } from '../../hooks/useGaugeData';

export interface GaugeChartProps {
  title: string;
  dataField: string;
  minValue?: number;
  maxValue?: number;
  colorStops?: Array<{
    offset: string;
    color: string;
  }>;
  showSummaryTable?: boolean;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  title,
  dataField,
  minValue = 0,
  maxValue = 10,
  colorStops = [
    { offset: "0%", color: "#e25b61" },    // Strong red
    { offset: "25%", color: "#f0b3ba" },   // Light red
    { offset: "50%", color: "#ead97c" },   // Yellow
    { offset: "75%", color: "#93c4b9" },   // Light green
    { offset: "100%", color: "#2ba88c" },  // Strong green
  ],
  showSummaryTable = true
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { value, summary, isLoading, error } = useGaugeData({ 
    dataField, 
    title 
  });
  
  useEffect(() => {
    if (!isLoading && !error && svgRef.current) {
      drawGaugeChart(value);
    }
  }, [value, isLoading, error]);
  
  const drawGaugeChart = (value: number) => {
    if (!svgRef.current) return;
    
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
      .domain([minValue, maxValue])
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
      .attr("id", `gauge-gradient-${dataField}`)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    // Add color stops from props
    colorStops.forEach(stop => {
      gradient.append("stop")
        .attr("offset", stop.offset)
        .attr("stop-color", stop.color);
    });
    
    // Add arc with gradient fill
    chartGroup.append("path")
      .attr("class", styles.gaugeArc)
      .attr("d", backgroundArc as any)
      .style("fill", `url(#gauge-gradient-${dataField})`);
    
    // Create a shadow filter
    const filter = svg.append("defs")
      .append("filter")
      .attr("id", `drop-shadow-${dataField}`)
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
    const tickData = Array.from({ length: maxValue - minValue + 1 }, (_, i) => minValue + i);
    
    chartGroup.selectAll(`.${styles.tickLine}`)
      .data(tickData)
      .enter()
      .append("line")
      .attr("class", styles.tickLine)
      .attr("x1", d => (innerRadius - 2) * Math.cos(scale(d) - Math.PI / 2))
      .attr("y1", d => (innerRadius - 2) * Math.sin(scale(d) - Math.PI / 2))
      .attr("x2", d => (outerRadius + 2) * Math.cos(scale(d) - Math.PI / 2))
      .attr("y2", d => (outerRadius + 2) * Math.sin(scale(d) - Math.PI / 2))
      .style("stroke", d => [minValue, (minValue + maxValue) / 2, maxValue].includes(d) ? "#333" : "#777")
      .style("stroke-width", d => [minValue, (minValue + maxValue) / 2, maxValue].includes(d) ? "2px" : "1px");
    
    // Add tick labels (fewer labels for cleaner look)
    const tickLabels = [minValue, 2, 4, 6, 8, maxValue]; // Customize based on min/max values
    
    chartGroup.selectAll(`.${styles.tickLabel}`)
      .data(tickLabels)
      .enter()
      .append("text")
      .attr("class", styles.tickLabel)
      .attr("x", d => (outerRadius + 20) * Math.cos(scale(d) - Math.PI / 2))
      .attr("y", d => (outerRadius + 20) * Math.sin(scale(d) - Math.PI / 2))
      .attr("text-anchor", d => {
        if (d === minValue) return "start";
        if (d === maxValue) return "end";
        return "middle";
      })
      .attr("dy", d => d === (minValue + maxValue) / 2 ? "0.4em" : 0)
      .text(d => d);
    
    // Calculate needle position
    const needleLength = outerRadius * 0.95;
    const needleAngle = scale(value);
    
    // Create needle group
    const needleGroup = chartGroup.append("g")
      .attr("class", styles.needle);

    // Draw needle
    needleGroup.append("path")
      .attr("d", `M 0 -3 L ${needleLength} 0 L 0 3 Z`)
      .attr("fill", "#484848");
      
    // Add needle cap
    needleGroup.append("circle")
      .attr("class", styles.needleCap)
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 8);
      
    // Add value display
    chartGroup.append("text")
      .attr("class", styles.gaugeValue)
      .attr("x", 0)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .style("opacity", 0)
      .text(value.toFixed(2));
      
    chartGroup.append("text")
      .attr("class", styles.gaugeLabel)
      .attr("x", 0)
      .attr("y", 70)
      .attr("text-anchor", "middle")
      .style("opacity", 0)
      .text("Life Satisfaction Score");
    
    // Animate needle
    needleGroup
      .style("opacity", 0)
      .attr("transform", `rotate(${-90})`)
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .style("opacity", 1)
      .attr("transform", `rotate(${(needleAngle * 180 / Math.PI) - 90})`);
      
    // Animate value text
    chartGroup.selectAll(`.${styles.gaugeValue}, .${styles.gaugeLabel}`)
      .transition()
      .delay(800)
      .duration(800)
      .style("opacity", 1);
  };
  
  const renderSummaryTable = () => {
    if (!summary) return null;
    
    return (
      <div className={styles.summaryTableContainer}>
        <h3>Summary Table</h3>
        <table className={styles.summaryTable}>
          <thead>
            <tr>
              <th>Field</th>
              <th>Min</th>
              <th>Max</th>
              <th>Mean</th>
              <th>
                Standard<br />Deviation
              </th>
              {/* Optional: Keep or remove variance column */}
              <th>Responses</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{summary.field}</td>
              <td>{Number.isInteger(summary.min) ? summary.min : summary.min.toFixed(2)}</td>
              <td>{Number.isInteger(summary.max) ? summary.max : summary.max.toFixed(2)}</td>
              <td>{summary.mean.toFixed(2)}</td>
              <td>{summary.stdDev.toFixed(2)}</td>
              {/* Optional: Keep or remove variance column */}
              <td>{summary.responses}</td>
            </tr>
          </tbody>
        </table>
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
    <div className={styles.gaugeChartContainer}>
      <h2><strong>{title}</strong></h2>
      <div className={styles.gaugeContainer}>
        <svg ref={svgRef}></svg>
      </div>
      {showSummaryTable && renderSummaryTable()}
    </div>
  );
};

export default GaugeChart;