import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Histograms = ({ isDashboard, selectedCluster }) => {
  const [originalData, setOriginalData] = useState([]); // 存储从后端获取的完整数据
  const [chartData, setChartData] = useState(null); // 用于 Chart.js 的数据

  // 获取初始数据
  useEffect(() => {
    axios
      .get("http://localhost:5000/histogram_data")
      .then((response) => {
        setOriginalData(response.data); // 存储原始数据
        updateChartData(response.data, selectedCluster); // 初始化 Chart 数据
      })
      .catch((error) => console.error("Error fetching histogram data:", error));
  }, []);

  // 监听 selectedCluster 的变化，更新 Chart 数据
  useEffect(() => {
    updateChartData(originalData, selectedCluster);
  }, [selectedCluster, originalData]);

  // 更新 Chart.js 数据
  const updateChartData = (data, cluster) => {
    if (!data || data.length === 0) return;

    // 如果选中的 cluster 是 "All"，显示所有数据；否则仅显示选中的 cluster 数据
    const filteredData =
      cluster === "All"
        ? data
        : data.filter((item) => item.cluster === parseInt(cluster, 10));

    // 格式化数据为 Chart.js 格式
    const labels = filteredData.map((item) => `Cluster ${item.cluster}`);
    const rushHourData = filteredData.map((item) => item.rush_hour);
    const bedtimeData = filteredData.map((item) => item.bedtime);
    const workHourData = filteredData.map((item) => item.work_hour);
    const weekendData = filteredData.map((item) => item.weekend);

    setChartData({
      labels,
      datasets: [
        {
          label: "Rush Hour",
          data: rushHourData,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
        },
        {
          label: "Bedtime",
          data: bedtimeData,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
        },
        {
          label: "Work Hour",
          data: workHourData,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
        {
          label: "Weekend",
          data: weekendData,
          backgroundColor: "rgba(201, 203, 207, 0.6)",
        },
      ],
    });
  };

  return chartData ? (
    <Bar
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false, // 禁用固定宽高比
        plugins: {
          legend: {
            position: "top", // 将图例放在顶部
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${context.raw}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Clusters",
            },
          },
          y: {
            title: {
              display: true,
              text: "Counts",
            },
            beginAtZero: true,
          },
        },
      }}
    />
  ) : (
    <div>Loading...</div>
  );
};

export default Histograms;
