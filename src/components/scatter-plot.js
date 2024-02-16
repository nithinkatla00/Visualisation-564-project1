import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';

const ScatterPlot = ({ data, width, height, xAxisName, yAxisName, theme }) => {
    const svgRef = useRef();
    console.log(data)

    useEffect(() => {
        let formattedData = data.map(([x, y]) => ({ x, y }));
        formattedData = formattedData.filter(d => !isNaN(d.x) && !isNaN(d.y));

        if (formattedData.length === 0) return;

        const xMin = d3.min(formattedData, d => d.x) * 0.95;
        const xMax = d3.max(formattedData, d => d.x) * 1.05;
        const yMin = d3.min(formattedData, d => d.y) * 0.95;
        const yMax = d3.max(formattedData, d => d.y) * 1.05;
    
        formattedData = formattedData.filter(d => d.x >= xMin && d.x <= xMax && d.y >= yMin && d.y <= yMax);


        if (formattedData.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const margin = { top: 30, right: 20, bottom: 60, left: 80 };
        const w = width - margin.left - margin.right;
        const h = height - margin.top - margin.bottom;

        const xScale = d3.scaleLinear()
            .domain([d3.min(formattedData, d => d.x), d3.max(formattedData, d => d.x)])
            .range([0, w]);
        
        const yScale = d3.scaleLinear()
            .domain([d3.min(formattedData, d => d.y), d3.max(formattedData, d => d.y)])
            .range([h, 0]);

        const chart = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);


        chart.append("g")
            .attr("transform", `translate(0,${h})`)
            .call(d3.axisBottom(xScale));

        chart.append("g")
            .call(d3.axisLeft(yScale));

        chart.append("text")
            .attr("fill", theme === 'light' ? "#000" : "white")
            .attr("x",  w /2 )
            .attr("y", h + 40 )
            .attr("text-anchor", "middle")
            .text(xAxisName);


        chart.append("text")
            .attr("fill", theme === 'light' ? "#000" : "white")
            .attr("transform",  "rotate(-90)")
            .attr("y",  -60 )
            .attr("x", -w / 3 )
            .attr("dy", "1em")
            .attr("text-anchor", "middle")
            .text(yAxisName);

        chart.selectAll(".point")
            .data(formattedData)
            .enter().append("circle")
            .attr("class", "point")
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", 4)
            .attr("fill", "#90ee90");

    }, [data, width, height, yAxisName, theme, xAxisName]);

    return (
        <Box sx={{ width, height }}>
            <svg ref={svgRef} width={width} height={height}></svg>
        </Box>
    );
};

export default ScatterPlot;
