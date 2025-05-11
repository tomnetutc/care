import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './Q1Visualization.css';
import { useFilters, FilterOption } from '../../context/FilterContext';

interface DataItem {
  [key: string]: string | number;
}

interface ProcessedDataItem {
  question: string;
  values: {
    category: string;
    value: number;
    count: number;
  }[];
}

interface SummaryStatistic {
  question: string;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  variance: number;
  responses: number;
}

// Helper function to sanitize text for use as CSS class names
const sanitizeForCssSelector = (text: string): string => {
  return text
    .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace any non-alphanumeric character with dash
    .replace(/-+/g, '-')            // Replace multiple consecutive dashes with a single dash
    .replace(/^-|-$/g, '')          // Remove leading and trailing dashes
    .toLowerCase();                  // Convert to lowercase for consistency
};

// Order of questions to match the reference image
const questionOrder = [
  "att_travel_satisfaction",
  "att_weather_concern",
  "att_weather_influence",
  "att_shop_instore",
  "att_mixed_use_neighborhood",
  "att_tech_ability",
  "att_environment_friendly",
  "att_transit_proximity",
  "att_tech_learning_frustration",
  "att_spacious_home",
  "att_physical_activity",
  "att_group_energy",
  "att_social_drain",
  "att_public_social"
];

// Labels for attitude questions with exact wording from the reference
const questionLabels: { [key: string]: string } = {
  att_travel_satisfaction: "My daily travel routine is generally satisfactory",
  att_weather_concern: "I worry about bad weather on my travel route",
  att_weather_influence: "Weather forecasts significantly influence my plans for outdoor activities",
  att_shop_instore: "I prefer to shop in a store rather than online",
  att_mixed_use_neighborhood: "I like the idea of having stores, restaurants, and offices mixed among the homes in my area",
  att_tech_ability: "I am confident in my ability to use modern technologies",
  att_environment_friendly: "I am committed to an environmentally-friendly lifestyle",
  att_transit_proximity: "I prefer to live close to transit, even if it means I'll have a smaller home and live in a more densely populated area",
  att_tech_learning_frustration: "Learning how to use new technologies is often frustrating for me",
  att_spacious_home: "I prefer to live in a spacious home, even if it is farther from public transportation or many places I go",
  att_physical_activity: "I try to incorporate physical activity into my daily routine whenever possible",
  att_group_energy: "I feel energized when I am part of a large group",
  att_social_drain: "I often feel drained after spending a few hours around people",
  att_public_social: "I enjoy the chance to meet people unexpectedly, interact with strangers, or make new acquaintances when I go out"
};

// Response categories and their colors (matching the reference image)
const responseCategories = [
  "Strongly disagree", 
  "Somewhat disagree", 
  "Neutral",
  "Somewhat agree", 
  "Strongly agree"
];

const categoryColors = [
  "#e25b61", // Strong red for strongly disagree
  "#f0b3ba", // Light red for somewhat disagree
  "#ead97c", // Yellow for neutral
  "#93c4b9", // Light green for somewhat agree
  "#2ba88c"  // Strong green for strongly agree
];

const Q1Visualization: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<ProcessedDataItem[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStatistic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResponses, setTotalResponses] = useState<number>(0);
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);  // Store the original data
  
  // Get filters from context
  const { filters } = useFilters();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const isGitHubPages = window.location.hostname.includes('github.io');
        const basePath = isGitHubPages ? '/hard' : '';
        const response = await fetch(`${basePath}/leaphi_final_data.csv`);
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

  // New function to process data with filters applied
  const processData = (parsedData: any[]) => {
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
    
    // Set total responses after filtering
    setTotalResponses(filteredData.length);
    
    // Process data to get distribution percentages for each question
    const processedData: ProcessedDataItem[] = questionOrder.map(column => {
      // Count responses in each category (1-5)
      const responseCounts = [0, 0, 0, 0, 0]; // 5 categories
      let validResponses = 0;
      
      filteredData.forEach(d => {
        const value = parseInt(d[column] as string);
        if (!isNaN(value) && value >= 1 && value <= 5) {
          responseCounts[value - 1]++;
          validResponses++;
        }
      });
      
      // Convert counts to percentages
      const responsePercentages = responseCounts.map(count => 
        validResponses > 0 ? (count / validResponses) * 100 : 0
      );
      
      return {
        question: questionLabels[column] || column,
        values: responseCategories.map((category, i) => ({
          category,
          value: responsePercentages[i],
          count: responseCounts[i]
        }))
      };
    });

    // Calculate summary statistics for each question
    const calculatedStats: SummaryStatistic[] = questionOrder.map(column => {
      const values: number[] = [];
      let validResponses = 0;
      
      filteredData.forEach(d => {
        const value = parseInt(d[column] as string);
        if (!isNaN(value) && value >= 1 && value <= 5) {
          values.push(value);
          validResponses++;
        }
      });
      
      // Calculate statistics (with safety checks for empty arrays)
      const min = values.length > 0 ? Math.min(...values) : 0;
      const max = values.length > 0 ? Math.max(...values) : 0;
      const mean = validResponses > 0 ? values.reduce((sum, val) => sum + val, 0) / validResponses : 0;
      const variance = validResponses > 0 ? values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validResponses : 0;
      const stdDev = Math.sqrt(variance);
      
      return {
        question: questionLabels[column] || column,
        min,
        max,
        mean,
        stdDev,
        variance,
        responses: validResponses
      };
    });

    setData(processedData);
    setSummaryStats(calculatedStats);
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (data.length === 0 || !svgRef.current) return;

    // Create tooltip div if it doesn't exist
    if (!tooltipRef.current) {
      tooltipRef.current = d3.select('body')
        .append('div')
        .attr('class', 'q1-tooltip')
        .node();
    }

    // Clear any existing visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 100, right: 10, bottom: 50, left: 280 }; // Increased right margin from 40 to 80
    const width = 1000 - margin.left - margin.right;
    const height = Math.max(600, data.length * 40) - margin.top - margin.bottom;

    // Create responsive SVG
    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add background gradient
    createBackgroundGradient(svg);

    // Create a title background
    svg.append('rect')
      .attr('x', -margin.left)
      .attr('y', -margin.top)
      .attr('width', width + margin.left + margin.right)
      .attr('height', margin.top)
      .attr('fill', 'url(#titleBackground)');

    // Create scales
    const y = d3.scaleBand()
      .domain(data.map(d => d.question))
      .range([0, height])
      .padding(0.3);
      
    const x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width]);

    // Create color scale
    const color = d3.scaleOrdinal()
      .domain(responseCategories)
      .range(categoryColors);

    // Add styled legend
    addLegend(svg, width, color, setHighlightedCategory);

    // Stack the data
    const stackedData = prepareStackedData(data);

    // Add axes
    addAxes(svg, y, x, height, margin);

    // Add the bars with transitions and interactivity
    addBars(svg, stackedData, y, x, color, tooltipRef);

    // Clean up on unmount
    return () => {
      if (tooltipRef.current) {
        d3.select(tooltipRef.current).remove();
        tooltipRef.current = null;
      }
    };
  }, [data, highlightedCategory, totalResponses]);

  // Helper functions for D3 visualization components
  function createBackgroundGradient(svg: d3.Selection<SVGGElement, unknown, null, undefined>) {
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'titleBackground')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
      
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#f8f9fa').attr('stop-opacity', 1);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#ffffff').attr('stop-opacity', 0.8);
  }

  function addLegend(
      svg: d3.Selection<SVGGElement, unknown, null, undefined>, 
      width: number, 
      color: d3.ScaleOrdinal<string, unknown>, 
      setHighlightedCategory: (category: string | null) => void
    ) {
    const legendGroup = svg.append('g')
      .attr('class', 'legend-group')
      .attr('transform', 'translate(0, -15)');
    
    // Define custom positions for each legend item
    const positions = [
      0,                // Strongly disagree
      width * 0.2 + 8,      // Somewhat disagree
      width * 0.4 + 30, // Neutral - add extra 10px space
      width * 0.6 + 2, // Somewhat agree - shifted right to accommodate Neutral
      width * 0.8 + 10  // Strongly agree - shifted right to accommodate Neutral
    ];
    
    responseCategories.forEach((category, i) => {
      const legendItem = legendGroup.append('g')
        .attr('class', `legend-item legend-item-${sanitizeForCssSelector(category)} ${category === "Neutral" ? "legend-item-neutral" : "legend-item-strong"}`)
        .attr('transform', `translate(${positions[i]}, 0)`)
        .on('mouseenter', () => {
          setHighlightedCategory(category);
          
          // Highlight this legend item
          d3.selectAll(`.legend-item`).style('opacity', 0.4);
          d3.select(`.legend-item-${sanitizeForCssSelector(category)}`).style('opacity', 1);
          
          // Highlight corresponding bars
          d3.selectAll(`.bar`).style('opacity', 0.2);
          d3.selectAll(`.bar-${sanitizeForCssSelector(category)}`).style('opacity', 1);
          
          // Show percentage labels only for this category
          d3.selectAll('.bar-label').style('opacity', 0);
          d3.selectAll(`.bar-label-${sanitizeForCssSelector(category)}`).style('opacity', 1);
        })
        .on('mouseleave', () => {
          setHighlightedCategory(null);
          
          // Reset highlighting
          d3.selectAll(`.legend-item`).style('opacity', 1);
          d3.selectAll(`.bar`).style('opacity', 1);
          d3.selectAll('.bar-label').style('opacity', 1);
        });
      
      // Add rectangle
      legendItem.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 14)
        .attr('height', 14)
        .attr('fill', color(category) as string);
        
      // Add text with consistent spacing
      legendItem.append('text')
        .attr('x', 22)  // Same spacing for all text
        .attr('y', 11)
        .text(category);
    });
  }

  function addAxes(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    y: d3.ScaleBand<string>,
    x: d3.ScaleLinear<number, number>,
    height: number,
    margin: { top: number, right: number, bottom: number, left: number }
  ) {
    // Y axis
    svg.append('g')
      .attr('class', 'y-axis axis')
      .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
      .call(g => g.selectAll(".domain").remove())
      .call(wrap, margin.left - 20);

    // X axis
    svg.append('g')
      .attr('class', 'x-axis axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`))
      .call(g => g.select(".domain").remove());
  }

  function prepareStackedData(data: ProcessedDataItem[]) {
    return data.map(d => {
      let cumulative = 0;
      return {
        question: d.question,
        questionId: sanitizeForCssSelector(d.question),
        segments: d.values.map(v => {
          const segment = {
            question: d.question,
            category: v.category,
            value: v.value,
            count: v.count,
            start: cumulative,
            end: cumulative + v.value
          };
          cumulative += v.value;
          return segment;
        })
      };
    });
  }

  function addBars(
      svg: d3.Selection<SVGGElement, unknown, null, undefined>,
      stackedData: ReturnType<typeof prepareStackedData>,
      y: d3.ScaleBand<string>,
      x: d3.ScaleLinear<number, number>,
      color: d3.ScaleOrdinal<string, unknown>,
      tooltipRef: React.MutableRefObject<HTMLDivElement | null>
    ) {
    stackedData.forEach(questionData => {
      const group = svg.append('g')
        .attr('class', `question-group-${questionData.questionId}`);
        
      questionData.segments.forEach(segment => {
        // Calculate bar dimensions
        const barHeight = y.bandwidth();
        const barY = y(segment.question) || 0;
        const barX = x(segment.start);
        const barWidth = x(segment.end) - x(segment.start);
        
        // Add bar
        group.append('rect')
          .attr('class', `bar bar-${sanitizeForCssSelector(segment.category)}`)
          .attr('y', barY)
          .attr('x', barX)
          .attr('height', barHeight)
          .attr('width', 0)
          .attr('fill', color(segment.category) as string)
          .on('mouseenter', function(event) {
            if (tooltipRef.current) {
              const tooltipContent = `
                <div class="tooltip-title">${segment.question}</div>
                <hr style="margin:5px 0">
                <div class="tooltip-content" style="color:${color(segment.category)}">
                  <strong>${segment.category}:</strong> ${segment.value.toFixed(1)}%
                </div>
                <div class="tooltip-count">(${segment.count} respondents)</div>
              `;
              
              d3.select(tooltipRef.current)
                .html(tooltipContent)
                .style('opacity', 0.9)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 30) + 'px');
            }
          })
          .on('mousemove', function(event) {
            if (tooltipRef.current) {
              d3.select(tooltipRef.current)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 30) + 'px');
            }
          })
          .on('mouseleave', function() {
            if (tooltipRef.current) {
              d3.select(tooltipRef.current).style('opacity', 0);
            }
          })
          .transition()
          .duration(800)
          .delay((_, i) => i * 50)
          .attr('width', barWidth);
          
        // Add percentage labels if segment is wide enough
        if (segment.value >= 5) {
          group.append('text')
            .attr('class', `bar-label bar-label-${sanitizeForCssSelector(segment.category)}`)
            .attr('y', barY + barHeight / 2)
            .attr('x', barX + barWidth / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#333')
            .style('opacity', 0)
            .text(`${segment.value.toFixed(1)}%`)
            .transition()
            .duration(800)
            .delay((_, i) => 800 + i * 50)
            .style('opacity', 1);
        }
      });
    });
  }

  // Helper function to wrap text with consistent first-label width
  function wrap(selection: d3.Selection<SVGGElement, unknown, null, undefined>, width: number) {
    // Create tooltip container once for performance
    let tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any> = d3.select('body').select('.y-axis-tooltip') as d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
    if (tooltip.empty()) {
      tooltip = d3.select('body')
        .append('div')
        .attr('class', 'y-axis-tooltip')
        .style('opacity', 0) as d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
    }

    // First pass: measure the width of the first text element
    let firstLabelWidth = 0;
    selection.select('text').each(function() {
      const node = this as SVGTextElement;
      // Store original text
      const originalText = d3.select(node).text();
      firstLabelWidth = node.getComputedTextLength();
    });

    // Add some padding to the width
    firstLabelWidth = Math.max(firstLabelWidth, 120); // Reduced from 150 to 120

    // Second pass: truncate text if needed and add hover behavior
    selection.selectAll('text').each(function() {
      const text = d3.select(this);
      const originalText = text.text();
      const node = this as SVGTextElement;
      
      // Store the full text for tooltip
      text.attr('data-full-text', originalText);

      // Check if text needs truncation
      if (node.getComputedTextLength() > firstLabelWidth) {
        // Truncate text
        let displayText = originalText;
        while (displayText.length > 3) {
          displayText = displayText.slice(0, -1);
          text.text(displayText + '...');
          if ((this as SVGTextElement).getComputedTextLength() <= firstLabelWidth) {
            break;
          }
        }
        
        // Add hover handler
        text
          .style('cursor', 'pointer')
          .on('mouseover', function(event) {
            const fullText = d3.select(this).attr('data-full-text');
            tooltip
              .html(fullText)
              .style('left', (event.pageX + 15) + 'px')
              .style('top', (event.pageY - 28) + 'px')
              .style('opacity', 1);
          })
          .on('mousemove', function(event) {
            tooltip
              .style('left', (event.pageX + 15) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          })
          .on('mouseout', function() {
            tooltip.style('opacity', 0);
          });
      }
    });
  }

  // Add this function for rendering the summary table
  const renderSummaryTable = () => {
    return (
      <div className="summary-table-container">
        <h3>Summary Statistics</h3>
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
            {summaryStats.map((stat, index) => (
              <tr key={index}>
                <td>{stat.question}</td>
                <td>{stat.min.toFixed(2)}</td>
                <td>{stat.max.toFixed(2)}</td>
                <td>{stat.mean.toFixed(2)}</td>
                <td>{stat.stdDev.toFixed(2)}</td>
                <td>{stat.variance.toFixed(2)}</td>
                <td>{stat.responses}</td>
              </tr>
            ))}
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
    <div className="q1-visualization-container">
      <h2>Question 1 - First, we want to learn about your lifestyle preferences. Please rate your agreement with the following statements.</h2>
      <svg ref={svgRef}></svg>
      {renderSummaryTable()}
    </div>
  );
};

export default Q1Visualization;