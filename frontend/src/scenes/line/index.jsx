import { Box } from "@mui/material";
import Header from "../../components/Header";
import LineChart from "../../components/ScatterPlot";

const Line = () => {
  return (
    <Box m="20px">
      <Header title="Scatter Plot" subtitle="Simple Scatter Plot" />
      <Box height="75vh">
        <LineChart />
      </Box>
    </Box>
  );
};

export default Line;
