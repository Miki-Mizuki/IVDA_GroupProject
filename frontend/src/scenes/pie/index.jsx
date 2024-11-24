import { Box } from "@mui/material";
import Header from "../../components/Header";
import PieChart from "../../components/PieChart";
import React from "react";

const Pie = () => {
  const data = {
    labels: ['Technology', 'Health', 'Finance', 'Education', 'Entertainment'],
    datasets: [
      {
        label: 'Reader Cluster 1',
        data: [300, 50, 100, 80, 120],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
      },
      {
        label: 'Reader Cluster 2',
        data: [200, 150, 90, 70, 110],
        backgroundColor: ['#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
      }
    ]
  };

  return (
    <Box m="20px">
      <Header title="Pie Chart" subtitle="Distribution of Article Categories" />
      <Box height="75vh">
        <PieChart data={data} />
      </Box>
    </Box>
  );
};

export default Pie;