import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * Reusable Pie/Donut Chart component using D3.js
 * @param {Array} data - Array of {label, value} objects
 * @param {Object} options - Chart configuration options
 */
export default function PieChart({ 
  data = [], 
  labelKey = 'label',
  valueKey = 'value',
  colors = d3.schemeCategory10,
  height = 300,
  innerRadius = 0, // Set to > 0 for donut chart
  showLegend = true,
  showLabels = true
}) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    const width = chartRef.current.clientWidth;
    const radius = Math.min(width, height) / 2 - 20;

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const formattedData = data.map(d => ({
      label: String(d[labelKey] || ''),
      value: Number(d[valueKey]) || 0
    }));

    // Create color scale
    const colorScale = d3.scaleOrdinal()
      .domain(formattedData.map(d => d.label))
      .range(colors);

    // Create pie generator
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    // Create arc generator
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    // Create arc for labels (positioned slightly outside)
    const labelArc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    // Create pie slices
    const slices = svg.selectAll('.slice')
      .data(pie(formattedData))
      .enter()
      .append('g')
      .attr('class', 'slice');

    slices.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.label))
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', function(d) {
            const [x, y] = arc.centroid(d);
            return `translate(${x * 0.1},${y * 0.1})`;
          })
          .attr('opacity', 0.8);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'translate(0,0)')
          .attr('opacity', 1);
      })
      .append('title')
      .text(d => `${d.data.label}: ${d.data.value} (${((d.data.value / d3.sum(formattedData, d => d.value)) * 100).toFixed(1)}%)`);

    // Add labels
    if (showLabels) {
      slices.append('text')
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .style('fill', '#fff')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .text(d => {
          const percentage = (d.data.value / d3.sum(formattedData, d => d.value)) * 100;
          return percentage > 5 ? `${percentage.toFixed(0)}%` : '';
        });
    }

    // Add legend
    if (showLegend) {
      const legend = d3.select(chartRef.current)
        .select('svg')
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(10, 20)`);

      const legendItems = legend.selectAll('.legend-item')
        .data(formattedData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 22})`);

      legendItems.append('rect')
        .attr('width', 16)
        .attr('height', 16)
        .attr('rx', 3)
        .attr('fill', d => colorScale(d.label));

      legendItems.append('text')
        .attr('x', 22)
        .attr('y', 8)
        .attr('dy', '0.35em')
        .style('fill', '#e2e8f0')
        .style('font-size', '12px')
        .text(d => `${d.label}: ${d.value}`);
    }

  }, [data, labelKey, valueKey, colors, height, innerRadius, showLegend, showLabels]);

  return <div ref={chartRef} className="w-full" style={{ minHeight: height }} />;
}
