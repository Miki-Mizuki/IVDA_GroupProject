import React, { useEffect, useState } from "react";
import axios from "axios";
import * as d3 from "d3";

import barImage from "../../data/bar.png";
import scatterImage from "../../data/scatter.png";
import pieImage from "../../data/pie.png";

const PolarCoordinatePlot = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/visualization");
      
      console.log("Data fetched:", response.data);

      const transformedData = response.data.map((item) => ({
        theta: item.theta,
        radius: item.radius,
        cluster: item.cluster,
      }));
      setData(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log("Data length passed to D3:", data.length);

    if (data.length === 0) return;
    
    const width = 1000;
    const height = 800;
    const radius = Math.min(width, height) / 2 - 80;

    d3.select("#polar-plot").selectAll("*").remove();

    const svg = d3
      .select("#polar-plot")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2 - 50}, ${height / 2})`);

    // const angleScale = d3.scaleLinear().domain([0, 2 * Math.PI]).range([0, 360]);
    const radiusExtent = d3.extent(data, (d) => d.radius);
    const radiusScale = d3.scaleLinear()
      .domain([radiusExtent[0], radiusExtent[1]])
      .range([0, radius]);

    const numRings = 10;
    for (let i = 0; i <= numRings; i++) {
      svg
        .append("circle")
        .attr("r", (i / numRings) * radius)
        .attr("fill", "none")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 0.5);
    }

    const numAngles = 24;
    for (let i = 0; i < numAngles; i++) {
      const angle = (i / numAngles) * 2 * Math.PI;
      const x = radius * Math.cos(angle - Math.PI / 2);
      const y = radius * Math.sin(angle - Math.PI / 2);
      svg
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#ddd")
        .attr("stroke-width", 0.5);
    }

    for (let i = 0; i < numAngles; i++) {
      const angle = (i / numAngles) * 2 * Math.PI;
      const x = (radius + 20) * Math.cos(angle - Math.PI / 2);
      const y = (radius + 20) * Math.sin(angle - Math.PI / 2);
      svg
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "10px")
        .style("fill", "#fff")
        .text(`${i}:00`);
    }

    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("background", "black")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("visibility", "hidden");

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    svg
      .selectAll("circle.point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", (d) => radiusScale(d.radius) * Math.cos(d.theta - Math.PI / 2))
      .attr("cy", (d) => radiusScale(d.radius) * Math.sin(d.theta - Math.PI / 2))
      .attr("r", 4)
      .attr("fill", (d) => colorScale(d.cluster))
      // .append("title")
      // .text((d) => `Cluster: ${d.cluster}, Radius: ${d.radius.toFixed(2)}`)
      
      .on("mouseover", function (event, d) {
        // console.log("Hovered data:", d);
        // console.log("Mouse event:", event);

        tooltip.style("visibility", "visible")
          .html(`Cluster: ${d.cluster}<br>Radius: ${d.radius.toFixed(2)}`);
      })
      .on("mousemove", function (event) {
        // console.log("Mouse move:", event.pageX, event.pageY);

        tooltip.style("top", `${event.pageY + 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });


    for (let i = 1; i <= numRings; i++) {
      svg
        .append("text")
        .attr("x", radiusScale(i))
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "10px")
        .style("fill", "#fff")
        .text(`${i}`);
    }

    const legend = svg
      .append("g")
      .attr("transform", `translate(${radius + 50}, ${-height / 2 + 50})`);

    const clusters = [...new Set(data.map((d) => d.cluster))];

    clusters.forEach((cluster, index) => {
      legend
        .append("circle")
        .attr("cx", 0)
        .attr("cy", index * 20)
        .attr("r", 6)
        .attr("fill", colorScale(cluster));

      legend
        .append("text")
        .attr("x", 15)
        .attr("y", index * 20)
        .attr("dominant-baseline", "middle")
        .style("font-size", "12px")
        .style("fill", "#fff")
        .text(`Cluster ${cluster}`);
    });
  }, [data]);
  return (
    <div>
      <div id="polar-plot">
        {/* D3 Polar Coordinate Plot will be rendered here */}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <img src={barImage} alt="Bar Chart" style={{ width: '30%' }} />
        <img src={scatterImage} alt="Scatter Plot" style={{ width: '30%' }} />
        <img src={pieImage} alt="Pie Chart" style={{ width: '30%' }} />
      </div>
    </div>
  );
};

export default PolarCoordinatePlot;
