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

const ScatterPlot = ({ selectedCluster, isDashboard }) => {
  const [chartData, setChartData] = useState(null); // 图表数据
  const [categories, setCategories] = useState([]); // category 列表

  useEffect(() => {
    axios
      .get("http://localhost:5000/scatter_plot")
      .then((response) => {
        const data = response.data;

        const uniqueCategories = [...new Set(data.map((item) => item.primary_category))];
        setCategories(uniqueCategories);

        const preparedData = prepareData(data, selectedCluster, uniqueCategories, isDashboard);
        setChartData(preparedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [isDashboard, selectedCluster]);

  const prepareData = (data, selectedCluster, categories, isDashboard) => {
    // 根据 cluster 过滤数据
    const filteredData =
      selectedCluster === "All" || selectedCluster === null || selectedCluster === undefined
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
          y: item.avg_maxscroll * 100, // 转换为百分比
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

  const options = {
    responsive: true,
    maintainAspectRatio: false, // 使图表适应容器大小
    plugins: {
      legend: {
        display: isDashboard ? false : true, // 显示图例
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const { x, y } = context.raw;
            return `Duration: ${x.toFixed(2)}, Coverage: ${y.toFixed(1)}%`; // 显示百分比
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
        min: 0,
        max: 200000,
        offset: true,
      },
      y: {
        title: {
          display: true,
          text: "Average Reading Coverage (%)", // 更新标题为百分比
        },
        min: 0,
        max: 100, // 设置百分比范围
        offset: true,
        ticks: {
          callback: (value) => `${value}%`, // 将刻度值显示为百分比
        },
      },
    },
  };

  return (
    <div style={{ height: "100%", position: "relative" }}>
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
