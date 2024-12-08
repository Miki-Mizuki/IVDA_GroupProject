import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as d3 from "d3";

const getThemeColors = () => {
  if (!window.matchMedia) {
    return {
      backgroundLineColor: "#ccc",
      textColor: "#000",
      tooltipBackgroundColor: "#fff",
      tooltipBorderColor: "#ccc",
    };
  }

  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return {
    backgroundLineColor: isDarkMode ? "#666" : "#ccc",
    textColor: isDarkMode ? "#000" : "#333",
    tooltipBackgroundColor: isDarkMode ? "#fff" : "#fff",
    tooltipBorderColor: isDarkMode ? "#fff" : "#ccc",
  };
};

const PolarCoordinatePlot = ({ isDashboard, onClusterSelect }) => {

  // console.log("onClusterSelect:", typeof onClusterSelect);

  const [data, setData] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 }); // 默认宽高
  const containerRef = useRef(null);
  const [themeColors, setThemeColors] = useState(getThemeColors());
  const [selectedTheta, setSelectedTheta] = useState("alpha");
  const [selectedRadius, setSelectedRadius] = useState("pca");

  const thetaOptions = [
    { label: "Avg Time Accessing Article", value: "alpha" },
    { label: "Weekday", value: "alpha_weekday" },
    { label: "Weekend", value: "alpha_weekend" },
    { label: "Early Weekday", value: "alpha_ear_weekday" },
    { label: "Late Weekday", value: "alpha_lat_weekday" },
    { label: "Early Weekend", value: "alpha_ear_weekend" },
    { label: "Late Weekend", value: "alpha_lat_weekend" },
  ];

  const radiusOptions = [
    { label: "Average Duration", value: "avg_duration" },
    { label: "Average Max Scroll", value: "avg_maxscroll" },
    { label: "Average Time per Scroll", value: "avg_time_per_scroll" },
    { label: "Average Time Accessing Article", value: "avg_time_accessing_article" },
    { label: "Average Weekday Time Accessing Article", value: "avg_weekday_time_accessing_article" },
    { label: "Variance Weekday Time Accessing Article", value: "var_weekday_time_accessing_article" },
    { label: "Rush Hour", value: "rush_hour" },
    { label: "Bedtime", value: "bedtime" },
    { label: "Work Hour", value: "work_hour" },
    { label: "Weekend", value: "weekend" },
    { label: "Shallow", value: "shallow" },
    { label: "Medium", value: "medium" },
    { label: "Deep", value: "deep" },
    { label: "PCA", value: "pca" },
  ];

  const fetchData = async (theta, radius) => {
    try {
      const response = await axios.get("http://localhost:5000/visualization", {
        params: { theta_chosen: theta, radius_chosen: radius },
      });

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
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  
    const handleChange = () => {
      setThemeColors(getThemeColors()); // 动态更新主题颜色
    };
  
    // 添加监听器
    mediaQuery.addEventListener("change", handleChange);
  
    // 清除监听器
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    fetchData(selectedTheta, selectedRadius);
  }, [selectedTheta, selectedRadius]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {

    if (data.length === 0) return;
    
    const { width, height } = dimensions;
    const radius = Math.min(width, height) / 2 - 30;

    d3.select("#polar-plot").selectAll("*").remove();

    const svg = d3
      .select("#polar-plot")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const colors = themeColors;

    const angleScale = d3.scaleLinear().domain([0, 2 * Math.PI]).range([0, 360]);
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
        .attr("stroke", colors.backgroundLineColor)
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
        .attr("stroke", colors.backgroundLineColor)
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
        .style("fill", colors.textColor)
        .text(`${i}:00`);
    }

    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("background", colors.tooltipBackgroundColor)
      .style("color", colors.textColor)
      .style("border", "1px solid${colors.tooltipBorderColor}")
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
      })
      .on("click", (event, d) => {
        if (typeof onClusterSelect === "function") {
          onClusterSelect(d.cluster);
        } else {
          console.error("onClusterSelect is not a function or is undefined");
        }
      });


    for (let i = 1; i <= numRings; i++) {
      svg
        .append("text")
        .attr("x", radiusScale(i))
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "10px")
        .style("fill", colors.textColor)
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
        .style("fill", colors.textColor)
        .text(`Cluster ${cluster}`);
    });
  }, [data, dimensions, themeColors]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        // padding: "20px",
        position: "relative",
        gap: "10px", // 间距
      }}
    >

<div style={{ display: "flex", marginLeft: "10px", flexDirection: "row", alignItems: "center", gap: "10px" }}>
    <label
      htmlFor="theta-select"
      style={{ fontSize: "14px",marginRight: "7px" }}>Select Theta:</label>

    <select
      id="theta-select"
      value={selectedTheta}
      onChange={(e) => setSelectedTheta(e.target.value)}
      style={{
        height: "30px",
        width: "200px",
        zIndex: 10,
      }}
    >
      {thetaOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>

      

      {/* 第二行：Radius选择 */}
      <div style={{ display: "flex", marginLeft: "10px", flexDirection: "row", alignItems: "center", gap: "10px" }}>
        <label htmlFor="radius-select" style={{ fontSize: "14px" }}>Select Radius:</label>
        <select
          id="radius-select"
          value={selectedRadius}
          onChange={(e) => setSelectedRadius(e.target.value)}
          style={{
            height: "30px",
            width: "200px",
            zIndex: 10,
          }}
        >
          {radiusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>


      <div
        id="polar-plot"
        ref={containerRef}
        style={{
          width: "100%",
          height: "600px", 
          position: "relative" 
        }}
      ></div>
    </div>
  );
};

export default PolarCoordinatePlot;
