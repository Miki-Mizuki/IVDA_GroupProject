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

const CategoryPieCharts = ({ cluster, isDashboard }) => {
  const [chartData, setChartData] = useState(null); // 当前显示的图表数据
  const [allData, setAllData] = useState([]); // 存储所有 cluster 的数据
  const [totalViews, setTotalViews] = useState(0); // 当前 cluster 的总阅读量
  const [topThree, setTopThree] = useState([]); // 存储Top 3类别信息
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从后端获取数据
    axios
      .get("http://localhost:5000/category_distribution_by_cluster")
      .then((response) => {
        const data = response.data;
        setAllData(data);

        // 如果指定了 cluster，直接加载对应数据
        if (cluster !== undefined) {
          const clusterData = data.find((item) => item.cluster === cluster);
          if (clusterData) {
            updateChartData(clusterData);
          }
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [cluster]);

  // 动态生成图表数据
  const updateChartData = (clusterData) => {
    const labels = Object.keys(clusterData.categories);
    const values = Object.values(clusterData.categories);
    const total = values.reduce((a, b) => a + b, 0);

    // 设置总阅读量
    setTotalViews(total);

    // 找到最大的类别索引，排除 "others"
    const sortedIndices = [...values.keys()]
      .sort((a, b) => values[b] - values[a])
      .filter((i) => labels[i].toLowerCase() !== "others"); // 排除 "others"
    const topThreeIndices = sortedIndices.slice(0, 3); // 选取前3大类别

    // 生成Top 3的类别信息
    const topThreeCategories = topThreeIndices.map((i) => ({
      category: labels[i],
      value: values[i],
    }));
    setTopThree(topThreeCategories);

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

  // 动态生成颜色
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

  // 动态生成边框宽度
  const generateBorderWidths = (length, highlightIndices) => {
    const borderWidths = [];
    for (let i = 0; i < length; i++) {
      borderWidths.push(highlightIndices.includes(i) ? 5 : 1); // Top 3 边框宽度为 5，其余为 1
    }
    return borderWidths;
  };

  return loading ? (
    <div>Loading...</div>
  ) : (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* 饼图 */}
      {chartData && (
        <div style={{ flex: 1, position: "relative", width: "100%" }}>
          <Pie
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false, // 允许高度自适应
              plugins: {
                legend: {
                  display: false, // 隐藏图例以节省空间
                },
                title: {
                  display: true,
                  text: `Cluster ${cluster} Distribution`,
                  font: {
                    size: 14,
                  },
                  padding: {
                    top: 10,
                    bottom: 10,
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

      {/* Top 3 Categories 说明 */}
      {!isDashboard && topThree.length > 0 && ( // 仅在非 Dashboard 中显示
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <h4>Top 3 Categories</h4>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
            {topThree.map((item, index) => (
              <li key={index} style={{ margin: "5px 0" }}>
                <strong>{index + 1}. {item.category}</strong>: {item.value} views
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CategoryPieCharts;
