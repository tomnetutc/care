import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';
import { useLikertData, sanitizeForCssSelector } from '../../hooks/useLikertData';
import { LikertChartProps, StackedData, ProcessedDataItem, ChartSegment } from '../../types/Helpers';
import styles from './LikertChart.module.css';

const LikertChart: React.FC<LikertChartProps> = ({
  questionId,
  title,
  subtitle,
  questionOrder = [],
  questionLabels = {},
  responseCategories = [
    "Strongly disagree", 
    "Somewhat disagree", 
    "Neutral",
    "Somewhat agree", 
    "Strongly agree"
  ],
  categoryColors = [
    "#e25b61", // Strong red for strongly disagree
    "#f0b3ba", // Light red for somewhat disagree
    "#ead97c", // Yellow for neutral
    "#93c4b9", // Light green for somewhat agree
    "#2ba88c"  // Strong green for strongly agree
  ],
  categoryLabels,
  showSummaryTable = true,
  dataProcessor,
  sourceCategories,
  legendWrap
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);
  
  // Use the custom hook to get data
  const { data, summaryStats, isLoading, error, totalResponses } = useLikertData({
    questionOrder,
    questionLabels,
    responseCategories,
    sourceCategories,
    dataProcessor
  });

  // Update dimensions on resize
  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = Math.max(600, data.length * 40);
        setDimensions({
          width: containerWidth,
          height: containerHeight
        });
      }
    };

    // Set initial dimensions
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [data.length]);
  
  // Create and update visualization
  useEffect(() => {
    if (data.length === 0 || !svgRef.current || dimensions.width === 0) return;

    // Create tooltip div if it doesn't exist
    if (!tooltipRef.current) {
      tooltipRef.current = d3.select('body')
        .append('div')
        .attr('class', styles.tooltip)
        .node();
    }

    // Clear any existing visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Calculate responsive dimensions with proper text/chart ratio
    const textWidth = dimensions.width * 0.30; // Always use 30% for text
    const chartWidth = dimensions.width * 0.70; // Always use 70% for chart
    
    // Set up margins with the proper ratio
    const margin = { 
      top: legendWrap ? 28 : Math.min(80, dimensions.width * 0.06),
      right: 16, // Fixed small right margin
      bottom: Math.min(50, dimensions.width * 0.05),
      left: textWidth
    };

    // Calculate width to maintain the ratio
    const width = chartWidth - margin.right; // Subtract right margin
    const barHeightMultiplier = dimensions.width > 768 ? 40 : 30;
    const height = Math.max(500, data.length * barHeightMultiplier) - margin.top - margin.bottom;

    // Create responsive SVG with better viewBox settings
    const svg = d3.select(svgRef.current)
      .attr('width', '100%') 
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', `0 0 ${dimensions.width} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMinYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add background gradient
    createBackgroundGradient(svg);

    // Create a title background
    svg.append('rect')
      .attr('x', -margin.left)
      .attr('y', -margin.top)
      .attr('width', dimensions.width)
      .attr('height', margin.top)
      .attr('fill', 'url(#titleBackground)')
      .attr('rx', 12)
      .attr('ry', 12);

    // Create scales
    const y = d3.scaleBand()
      .domain(data.map(d => d.question))
      .range([0, height])
      .padding(0.1);
      
    const x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width]);

    // Create color scale
    const color = d3.scaleOrdinal<string>()
      .domain(responseCategories)
      .range(categoryColors);

    // Add styled legend with responsive positioning
    if (!legendWrap) {
      addLegend(svg, width, color, setHighlightedCategory, responseCategories);
    }

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
  }, [data, highlightedCategory, totalResponses, dimensions, responseCategories, categoryColors, legendWrap]);

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
    color: d3.ScaleOrdinal<string, string>, 
    setHighlightedCategory: (category: string | null) => void,
    categories: string[]
  ) {
    // Create a hidden text element to measure text widths
    const textMeasurer = svg.append('text')
      .attr('visibility', 'hidden')
      .style('font-size', '12px');
    
    // Calculate text widths for each category
    const textWidths = categories.map(category => {
      textMeasurer.text(category);
      return textMeasurer.node()?.getComputedTextLength() || 0;
    });
    
    // Remove the measuring element
    textMeasurer.remove();
    
    // Calculate total items width (rectangle width + padding + text width + item spacing)
    const rectWidth = 14;
    const rectTextGap = 8;
    const itemSpacing = 20;  // minimum spacing between items
    
    // Calculate item widths (rectangle + gap + text)
    const itemWidths = textWidths.map(textWidth => rectWidth + rectTextGap + textWidth);
    
    // Create the legend group with centering
    const legendGroup = svg.append('g')
      .attr('class', styles.legendGroup)
      .attr('transform', `translate(${width/2}, -15)`);

    // Calculate positions for each item (centered)
    let totalWidth = d3.sum(itemWidths) + (itemSpacing * (categories.length - 1));
    let currentX = -totalWidth / 2;  // Start from left side of centered area
    
    // Create legend items with proper spacing
    categories.forEach((category, i) => {
      const legendItem = legendGroup.append('g')
        .attr('class', styles.legendItem)
        .attr('data-category', sanitizeForCssSelector(category))
        .attr('transform', `translate(${currentX}, 0)`)
        .on('mouseenter', () => {
          setHighlightedCategory(category);
          
          // Use attribute selectors instead of class selectors with CSS modules
          d3.selectAll(`g[class="${styles.legendItem}"]`).style('opacity', 0.4);
          d3.selectAll(`g[class="${styles.legendItem}"][data-category="${sanitizeForCssSelector(category)}"]`).style('opacity', 1);
          
          d3.selectAll(`rect[class="${styles.bar}"]`).style('opacity', 0.2);
          d3.selectAll(`rect[class="${styles.bar}"][data-category="${sanitizeForCssSelector(category)}"]`).style('opacity', 1);
          
          d3.selectAll(`text[class="${styles.barLabel}"]`).style('opacity', 0);
          d3.selectAll(`text[class="${styles.barLabel}"][data-category="${sanitizeForCssSelector(category)}"]`).style('opacity', 1);
        })
        .on('mouseleave', () => {
          setHighlightedCategory(null);
          
          d3.selectAll(`g[class="${styles.legendItem}"]`).style('opacity', 1);
          d3.selectAll(`rect[class="${styles.bar}"]`).style('opacity', 1);
          d3.selectAll(`text[class="${styles.barLabel}"]`).style('opacity', 1);
        });
      
      // Add colored rectangle
      legendItem.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', rectWidth)
        .attr('height', 14)
        .attr('fill', color(category));
        
      // Add text with consistent alignment to rectangle
      legendItem.append('text')
        .attr('x', rectWidth + rectTextGap)
        .attr('y', 11)
        .attr('fill', '#333')
        .text(category);
    
      // Update currentX position for next item
      currentX += itemWidths[i] + itemSpacing;
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
      .attr('class', `${styles.yAxis} ${styles.axis}`)
      .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
      .call(g => g.selectAll(".domain").remove())
      .call(wrap, margin.left * 0.9); // Use 90% of the text area width

    // X axis
    svg.append('g')
      .attr('class', `${styles.xAxis} ${styles.axis}`)
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`))
      .call(g => g.select(".domain").remove());
  }

  function prepareStackedData(inputData: ProcessedDataItem[]): StackedData[] {
    return inputData.map(d => {
      let cumulative = 0;
      return {
        question: d.question,
        questionId: sanitizeForCssSelector(d.question),
        segments: d.values.map((v) => {
          const segment: ChartSegment = {
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
    stackedData: StackedData[],
    y: d3.ScaleBand<string>,
    x: d3.ScaleLinear<number, number>,
    color: d3.ScaleOrdinal<string, string>,
    tooltipRef: React.MutableRefObject<HTMLDivElement | null>
  ) {
    // Calculate fixed bar height to ensure consistency
    const barHeight = y.bandwidth();
    
    stackedData.forEach(questionData => {
      const group = svg.append('g')
        .attr('class', `question-group-${questionData.questionId}`);
        
      questionData.segments.forEach((segment: ChartSegment) => {
        // Use the precalculated fixed bar height
        const barY = y(segment.question) || 0;
        const barX = x(segment.start);
        const barWidth = x(segment.end) - x(segment.start);
        
        // Add bar with consistent height
        group.append('rect')
          .attr('class', styles.bar)
          .attr('data-category', sanitizeForCssSelector(segment.category))
          .attr('y', barY)
          .attr('x', barX)
          .attr('height', barHeight)
          .attr('width', 0)
          .attr('fill', color(segment.category))
          .on('mouseenter', function(event) {
            if (tooltipRef.current) {
              const tooltipContent = `
                <div class="${styles.tooltipTitle}">${segment.category}</div>
                ${segment.value.toFixed(1)}%
                <div class="${styles.tooltipCount}">n = ${segment.count.toLocaleString()}</div>
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
            .attr('class', styles.barLabel)
            .attr('data-category', sanitizeForCssSelector(segment.category))
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

  // Helper function to wrap text with responsive width
  function wrap(selection: d3.Selection<SVGGElement, unknown, null, undefined>, width: number) {
    // Create tooltip container once for performance
    let tooltip = d3.select('body').select<HTMLDivElement>(`.${styles.yAxisTooltip}`);
    if (tooltip.empty()) {
      tooltip = d3.select('body')
        .append('div')
        .attr('class', styles.yAxisTooltip)
        .style('opacity', 0);
    }

    // Process each text element
    selection.selectAll('text').each(function() {
      const text = d3.select(this);
      const originalText = text.text();
      const node = this as SVGTextElement;
      
      // Store the full text for tooltip
      text.attr('data-full-text', originalText);
      
      // Calculate available width
      const textAreaWidth = width * 0.9;
      
      // Check if text needs truncation
      if (node.getComputedTextLength() > textAreaWidth) {
        // Truncate text
        let displayText = originalText;
        while (displayText.length > 3) {
          displayText = displayText.slice(0, -1);
          text.text(displayText + '...');
          if ((this as SVGTextElement).getComputedTextLength() <= textAreaWidth) {
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

  // Render summary table
  function renderSummaryTable() {
    if (!showSummaryTable) return null;
    
    return (
      <div className={styles.summaryTableContainer}>
        <h3>Summary Table</h3>
        <table className={styles.summaryTable}>
          <thead>
            <tr>
              <th>Attributes</th>
              <th>Min</th>
              <th>Max</th>
              <th>Mean</th>
              <th>
                Standard<br />Deviation
              </th>
              <th>Sample Size</th>
            </tr>
          </thead>
          <tbody>
            {summaryStats.map((stat, index) => (
              <tr key={index}>
                <td>{stat.question}</td>
                <td>{Number.isInteger(stat.min) ? stat.min : stat.min.toFixed(2)}</td>
                <td>{Number.isInteger(stat.max) ? stat.max : stat.max.toFixed(2)}</td>
                <td>{stat.mean.toFixed(2)}</td>
                <td>{stat.stdDev.toFixed(2)}</td>
                <td>{stat.responses.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // --- HTML Legend for legendWrap ---
  function HTMLLegend() {
    return (
      <div
        className={styles.legendGroup + ' ' + styles.legendWrap + ' ' + styles.q22TightLegend}
        style={{ marginTop: 8, width: '100%' }}
      >
        {responseCategories.map((category, i) => (
          <div
            key={category}
            className={styles.legendItem}
            data-category={sanitizeForCssSelector(category)}
            style={{
              display: 'flex',
              alignItems: 'center',
              opacity: highlightedCategory && highlightedCategory !== category ? 0.4 : 1,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={() => setHighlightedCategory(category)}
            onMouseLeave={() => setHighlightedCategory(null)}
          >
            <div
              style={{
                width: 14,
                height: 14,
                background: categoryColors[i],
                border: '1px solid #333',
                borderRadius: 2,
                marginRight: 8,
              }}
            />
            <span style={{fontSize: 12, color: '#333'}}>{category}</span>
          </div>
        ))}
      </div>
    );
  }

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
    <div className={styles.chartContainer + (legendWrap ? ' ' + styles.q22CardBackground : '')} ref={containerRef}>
      <h2><strong>{title}</strong></h2>
      {subtitle && <p>{subtitle}</p>}
      {legendWrap ? <HTMLLegend /> : null}
      <svg ref={svgRef}></svg>
      {renderSummaryTable()}
    </div>
  );
};

export default LikertChart;