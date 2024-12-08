import React, { useEffect, useState } from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  LinearScale,
  Title,
} from "chart.js";
import axios from "axios";

ChartJS.register(PointElement, LineElement, Tooltip, Legend, LinearScale, Title);

const ScatterPlot = ({ isDashboard }) => {
  const [chartData, setChartData] = useState(null); // 图表数据
  const [clusters, setClusters] = useState([]); // cluster 列表
  const [categories, setCategories] = useState([]); // category 列表
  const [selectedCluster, setSelectedCluster] = useState("All"); // 当前选中 cluster

  const [xRange, setXRange] = useState({ min: 0, max: 200000 }); // 横轴范围
  const [xMax, setXMax] = useState(200000); // 数据中 x 的最大值

  useEffect(() => {
    axios
      .get("http://localhost:5000/scatter_plot")
      .then((response) => {
        const data = response.data;

        const uniqueClusters = ["All", ...new Set(data.map((item) => item.cluster))];
        setClusters(uniqueClusters);

        const uniqueCategories = [...new Set(data.map((item) => item.primary_category))];
        setCategories(uniqueCategories);

        const preparedData = prepareData(data, "All", uniqueCategories, isDashboard);
        setChartData(preparedData);

        // 动态设置 x 的最大值
        const maxDuration = Math.max(...data.map((item) => item.avg_duration));
        setXRange({ min: 0, max: Math.min(maxDuration, 200000) });
        setXMax(maxDuration);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [isDashboard]);

  const prepareData = (data, selectedCluster, categories, isDashboard) => {
    // 根据 cluster 过滤数据
    const filteredData =
      selectedCluster === "All"
        ? data
        : data.filter((item) => item.cluster === parseInt(selectedCluster, 10));

    // 如果是 Dashboard 模式，移除 "others" 类别
    const dashboardFilteredData = isDashboard
      ? filteredData.filter((item) => item.primary_category !== "others")
      : filteredData;

    // 按 category 分组数据
    const groupedData = categories.reduce((acc, category) => {
      if (isDashboard && category === "others") return acc;
      acc[category] = dashboardFilteredData.filter(
        (item) => item.primary_category === category
      );
      return acc;
    }, {});

    return {
      datasets: Object.entries(groupedData).map(([category, items], index) => ({
        label: category,
        data: items.map((item) => ({
          x: item.avg_duration,
          y: item.avg_maxscroll * 100,
        })),
        backgroundColor: generateColors(categories.length)[index],
        
      })),
    };
  };

  const generateColors = (length) => {
    const colors = [];
    for (let i = 0; i < length; i++) {
      const hue = Math.floor((360 / length) * i); // 均匀分布在色环上
      const saturation = 70; // 饱和度
      const lightness = 60; // 亮度
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
  };

  const handleClusterChange = (event) => {
    const selected = event.target.value;
    setSelectedCluster(selected);

    axios
      .get("http://localhost:5000/scatter_plot")
      .then((response) => {
        const preparedData = prepareData(response.data, selected, categories, isDashboard);
        setChartData(preparedData);
      })
      .catch((error) => console.error("Error filtering data:", error));
  };

  const handleRangeChange = (event) => {
    const newMax = parseInt(event.target.value, 10);
    if (newMax >= xRange.min && newMax <= xMax) {
      setXRange((prev) => ({ ...prev, max: newMax }));
    }
  };

  const handleInputChange = (event) => {
    const newMax = parseInt(event.target.value, 10);
    if (!isNaN(newMax) && newMax >= xRange.min && newMax <= xMax) {
      setXRange((prev) => ({ ...prev, max: newMax }));
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    
    plugins: {
      legend: {
        display: isDashboard ? false : true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const { x, y } = context.raw;
            return `Duration: ${x.toFixed(2)}, Coverage: ${y.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Average Reading Duration",
        },
        offset: true,
        min: xRange.min,
        max: xRange.max,
      },
      y: {
        title: {
          display: true,
          text: "Average Reading Coverage (%)",
        },
        min: 0,
        max: 100, // 固定纵轴范围为百分比
        offset: true,
        ticks: {
          callback: (value) => `${value}%`, // 显示为百分比
        },
      },
    },
  };

  return (
    <div style={{ height: "100%", position: "relative" }}>
      {!isDashboard && (
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="cluster-select" style={{ marginRight: "10px" }}>
            Select Cluster:
          </label>
          <select
            id="cluster-select"
            value={selectedCluster}
            onChange={handleClusterChange}
            style={{ padding: "5px", fontSize: "14px", borderRadius: "4px" }}
          >
            {clusters.map((cluster) => (
              <option key={cluster} value={cluster}>
                {cluster === "All" ? "All Clusters" : `Cluster ${cluster}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 滑块控制 */}
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}>
        <label htmlFor="x-range-slider" style={{ marginRight: "10px" }}>
          Adjust Duration Range:
        </label>
        <input
          id="x-range-slider"
          type="range"
          min={xRange.min}
          max={xMax}
          value={xRange.max}
          onChange={handleRangeChange}
          style={{ width: "300px", marginRight: "10px" }}
        />
        <input
          type="number"
          value={xRange.max}
          onChange={handleInputChange}
          style={{ width: "80px", padding: "5px", borderRadius: "4px" }}
        />
      </div>

      {/* 图表 */}
      {chartData ? (
        <Scatter data={chartData} options={options} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ScatterPlot;
