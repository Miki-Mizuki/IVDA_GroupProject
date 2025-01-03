import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const CategoryPieChart = () => {
  const [chartData, setChartData] = useState(null); // 当前显示的图表数据
  const [allData, setAllData] = useState([]); // 存储所有 cluster 的数据
  const [selectedCluster, setSelectedCluster] = useState(""); // 当前选中的 cluster
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0); // 当前 cluster 的总阅读量

  useEffect(() => {
    // 从后端获取数据
    axios
      .get("http://localhost:5000/category_distribution_by_cluster")
      .then((response) => {
        const data = response.data;
        setAllData(data);

        // 默认选中第一个 cluster
        if (data.length > 0) {
          setSelectedCluster(data[0].cluster);
          updateChartData(data[0]);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const updateChartData = (clusterData) => {
    const labels = Object.keys(clusterData.categories);
    const values = Object.values(clusterData.categories);
    const total = values.reduce((a, b) => a + b, 0);

    // 找到最大的类别索引，排除 "others"
    const sortedIndices = [...values.keys()]
      .sort((a, b) => values[b] - values[a])
      .filter((i) => labels[i].toLowerCase() !== "others"); // 排除 "others"
    const topThreeIndices = sortedIndices.slice(0, 3); // 选取前3大类别

    // 设置总阅读量
    setTotalViews(total);

    // 生成饼图数据
    const newChartData = {
      labels,
      datasets: [
        {
          label: `Cluster ${clusterData.cluster} Preferences`,
          data: values,
          backgroundColor: generateColors(labels.length, topThreeIndices),
          borderColor: generateColors(labels.length, topThreeIndices, true),
          borderWidth: generateBorderWidths(labels.length, topThreeIndices),
        },
      ],
    };

    setChartData(newChartData);
  };

  const generateColors = (length, highlightIndices = [], border = false) => {
    const colors = [];
    for (let i = 0; i < length; i++) {
      const hue = Math.floor((360 / length) * i); // 均匀分布在色环上
      const saturation = highlightIndices.includes(i) ? 80 : 50; // 高亮类别更饱和
      const lightness = highlightIndices.includes(i) ? 50 : 70; // 高亮类别更暗
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
  };

  const generateBorderWidths = (length, highlightIndices) => {
    const borderWidths = [];
    for (let i = 0; i < length; i++) {
      borderWidths.push(highlightIndices.includes(i) ? 5 : 1); // Top 3 边框宽度为 5，其余为 1
    }
    return borderWidths;
  };

  const handleClusterChange = (event) => {
    const cluster = event.target.value;
    setSelectedCluster(cluster);

    // 更新图表数据
    const clusterData = allData.find((item) => item.cluster.toString() === cluster);
    if (clusterData) {
      updateChartData(clusterData);
    }
  };

  return loading ? (
    <div>Loading...</div>
  ) : (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* 下拉选择器 */}
      <div style={{ marginBottom: "20px"}}>
        <label htmlFor="cluster-select">Select Cluster: </label>
        <select
          id="cluster-select"
          value={selectedCluster}
          onChange={handleClusterChange}
          style={{
            padding: "5px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          {allData.map((clusterData) => (
            <option key={clusterData.cluster} value={clusterData.cluster}>
              Cluster {clusterData.cluster}
            </option>
          ))}
        </select>
      </div>

      {/* 饼图 */}
      {chartData && (
        <div style={{ flex: 1, position: "relative" }}>
          <Pie
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "right",
                  labels: {
                    font: {
                      size: 20,
                    },
                    padding: 30,
                  },
                },
                title: {
                  display: true,
                  text: `Cluster ${selectedCluster} Article Category Distribution`,
                  font: {
                    size: 18,
                  },
                  padding: {
                    top: 20,
                    bottom: 20,
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (tooltipItem) => {
                      const value = tooltipItem.raw;
                      const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
                      const percentage = ((value / total) * 100).toFixed(2);
                      return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    },
                  },
                },
              },
              layout: {
                padding: {
                  top: 20,
                  bottom: 20,
                  left: 10,
                  right: 10,
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryPieChart;
