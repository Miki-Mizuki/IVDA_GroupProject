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

const Histogram = ({ isDashboard }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // 从后端获取数据
    axios
      .get("http://localhost:5000/histogram_data")
      .then((response) => {
        const data = response.data;

        // 格式化数据为 Chart.js 格式
        const labels = data.map((item) => `Cluster ${item.cluster}`);
        const rushHourData = data.map((item) => item.rush_hour);
        const bedtimeData = data.map((item) => item.bedtime);
        const workHourData = data.map((item) => item.work_hour);
        const weekendData = data.map((item) => item.weekend);

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
      })
      .catch((error) => console.error("Error fetching histogram data:", error));
  }, []);

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

export default Histogram;
