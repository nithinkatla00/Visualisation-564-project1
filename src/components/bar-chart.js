import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';

const BarChart = ({ data, theme, width, height, isSideways, xAxisName, yAxisName }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Adjust margins to ensure space for axis labels and chart readability.
        const margin = { top: 30, right: 20, bottom: 60, left: 80 };
        const effectiveWidth = width - margin.left - margin.right;
        const effectiveHeight = height - margin.top - margin.bottom;

        // Prepare the data.
        const topData = Object.entries(data)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 30); 
        const displayedData = topData.map(([key, value], i) => ({
            category: `${i + 1}`,
            value: value
        }));

        // Define scales based on the orientation.
        const xScale = isSideways ? 
            d3.scaleLinear()
                .domain([0, d3.max(displayedData, d => d.value)])
                .range([0, effectiveHeight]) :
            d3.scaleBand()
                .domain(displayedData.map(d => d.category))
                .range([0, effectiveWidth])
                .padding(0.1);

        const yScale = isSideways ? 
            d3.scaleBand()
                .domain(displayedData.map(d => d.category))
                .range([0, effectiveHeight])
                .padding(0.1) :
            d3.scaleLinear()
                .domain([0, d3.max(displayedData, d => d.value)])
                .range([effectiveHeight, 0]);


        // Append groups for the axes and position them.
        const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        if (isSideways) {
            chart.append("g")
                .call(d3.axisTop(xScale))
                .attr("transform", `translate(0,0)`);

            chart.append("g")
                .call(d3.axisLeft(yScale));
        } else {
            chart.append("g")
                .call(d3.axisBottom(xScale))
                .attr("transform", `translate(0,${effectiveHeight})`);

            chart.append("g")
                .call(d3.axisLeft(yScale));
        }
        chart.append("text")
            .attr("fill", theme === 'light' ? "#000" : "white")
            .attr("x", isSideways ? effectiveHeight /2 : effectiveHeight)
            .attr("y", isSideways ? -20 : effectiveHeight + 40)
            .attr("text-anchor", "middle")
            .text(xAxisName);

        // Append Y axis name
        chart.append("text")
            .attr("fill", theme === 'light' ? "#000" : "white")
            .attr("transform", isSideways ? "rotate(-90)" : "rotate(-90)")
            .attr("y", isSideways ? -50 : -45)
            .attr("x", isSideways ? -effectiveWidth / 3 : -250)
            .attr("dy", "1em")
            .attr("text-anchor", "middle")
            .text(yAxisName);
        // Draw bars based on orientation.
        chart.selectAll(".bar")
            .data(displayedData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => isSideways ? 0 : xScale(d.category))
            .attr("y", d => isSideways ? yScale(d.category) : yScale(d.value))
            .attr("width", d => isSideways ? xScale(d.value) : xScale.bandwidth())
            .attr("height", d => isSideways ? yScale.bandwidth() : effectiveHeight - yScale(d.value))
            .style("fill", "#90ee90");

    }, [data, width, height, isSideways, theme, xAxisName, yAxisName]);

    return (
        <Box sx={{ width, height }}>
            <svg ref={svgRef} width={width} height={height}></svg>
        </Box>
    );
};

export default BarChart;
