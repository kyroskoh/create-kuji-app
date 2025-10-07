import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * Reusable Bar Chart component using D3.js
 * @param {Array} data - Array of {label, value} objects
 * @param {Object} options - Chart configuration options
 */
export default function BarChart({ 
  data = [], 
  xKey = 'label',
  yKey = 'value',
  color = '#3b82f6',
  height = 300,
  margin = { top: 20, right: 30, bottom: 60, left: 60 },
  xLabel = '',
  yLabel = '',
  horizontal = false
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

    const formattedData = data.map(d => ({
      label: String(d[xKey] || ''),
      value: Number(d[yKey]) || 0
    }));

    if (!horizontal) {
      // Vertical bar chart
      const x = d3.scaleBand()
        .domain(formattedData.map(d => d.label))
        .range([0, width])
        .padding(0.2);

      const y = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.value) || 10])
        .nice()
        .range([chartHeight, 0]);

      // Add bars
      svg.selectAll('.bar')
        .data(formattedData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.label))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => chartHeight - y(d.value))
        .attr('fill', color)
        .attr('rx', 4)
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          d3.select(this).attr('opacity', 0.8);
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
        })
        .append('title')
        .text(d => `${d.label}: ${d.value}`);

      // X axis
      svg.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)')
        .style('fill', '#94a3b8');

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
    } else {
      // Horizontal bar chart
      const y = d3.scaleBand()
        .domain(formattedData.map(d => d.label))
        .range([0, chartHeight])
        .padding(0.2);

      const x = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.value) || 10])
        .nice()
        .range([0, width]);

      // Add bars
      svg.selectAll('.bar')
        .data(formattedData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', d => y(d.label))
        .attr('x', 0)
        .attr('height', y.bandwidth())
        .attr('width', d => x(d.value))
        .attr('fill', color)
        .attr('rx', 4)
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          d3.select(this).attr('opacity', 0.8);
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
        })
        .append('title')
        .text(d => `${d.label}: ${d.value}`);

      // Y axis (labels on left)
      svg.append('g')
        .call(d3.axisLeft(y))
        .style('color', '#94a3b8');

      // X axis (values on bottom)
      svg.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x).ticks(5))
        .style('color', '#94a3b8');

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
    }

  }, [data, xKey, yKey, color, height, margin, xLabel, yLabel, horizontal]);

  return <div ref={chartRef} className="w-full" style={{ minHeight: height }} />;
}
