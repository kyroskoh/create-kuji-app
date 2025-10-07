import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * Reusable Line Chart component using D3.js
 * @param {Array} data - Array of {date, value} objects
 * @param {Object} options - Chart configuration options
 */
export default function LineChart({ 
  data = [], 
  xKey = 'date',
  yKey = 'value',
  color = '#3b82f6',
  height = 300,
  margin = { top: 20, right: 30, bottom: 40, left: 60 },
  xLabel = '',
  yLabel = '',
  curve = d3.curveMonotoneX,
  showArea = false,
  showDots = true
}) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse data
    const parseDate = (d) => {
      if (d instanceof Date) return d;
      return new Date(d);
    };

    const formattedData = data.map(d => ({
      x: parseDate(d[xKey]),
      y: Number(d[yKey]) || 0
    }));

    // Scales
    const x = d3.scaleTime()
      .domain(d3.extent(formattedData, d => d.x))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(formattedData, d => d.y) || 10])
      .nice()
      .range([chartHeight, 0]);

    // Line generator
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(curve);

    // Area generator (if showArea is true)
    if (showArea) {
      const area = d3.area()
        .x(d => x(d.x))
        .y0(chartHeight)
        .y1(d => y(d.y))
        .curve(curve);

      // Add gradient
      const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'line-area-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.4);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0);

      // Add area
      svg.append('path')
        .datum(formattedData)
        .attr('fill', 'url(#line-area-gradient)')
        .attr('d', area);
    }

    // Add line
    svg.append('path')
      .datum(formattedData)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Add dots (if showDots is true)
    if (showDots) {
      svg.selectAll('.dot')
        .data(formattedData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.x))
        .attr('cy', d => y(d.y))
        .attr('r', 4)
        .attr('fill', color)
        .attr('stroke', '#1e293b')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .append('title')
        .text(d => `${d.x.toLocaleDateString()}: ${d.y}`);
    }

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(6))
      .style('color', '#94a3b8');

    // Y axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .style('color', '#94a3b8');

    // Y axis label
    if (yLabel) {
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (chartHeight / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', '#94a3b8')
        .style('font-size', '12px')
        .text(yLabel);
    }

    // X axis label
    if (xLabel) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', chartHeight + margin.bottom - 5)
        .style('text-anchor', 'middle')
        .style('fill', '#94a3b8')
        .style('font-size', '12px')
        .text(xLabel);
    }

  }, [data, xKey, yKey, color, height, margin, xLabel, yLabel, curve, showArea, showDots]);

  return <div ref={chartRef} className="w-full" style={{ minHeight: height }} />;
}
