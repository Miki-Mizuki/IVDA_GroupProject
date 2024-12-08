import { Box, Button, IconButton, Typography, useTheme, Modal } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import ScatterPlots from "../../components/ScatterPlots";
import PolarCoordinatePlot from "../../components/clock";
import Histograms from "../../components/Histograms";
import CategoryPieCharts from "../../components/PieCharts";
import { useState } from "react";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [selectedCluster, setSelectedCluster] = useState("All");
  const [openModal, setOpenModal] = useState(false);
  const [modalCluster, setModalCluster] = useState(null);

  const handleClusterSelect = (cluster) => {
    console.log(`Cluster selected: ${cluster}`); // Debug log
    setSelectedCluster(cluster);
  };

  // 打开模态框
  const handleOpenModal = (cluster) => {
    setModalCluster(cluster);
    setOpenModal(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setOpenModal(false);
    setModalCluster(null);
  };

  const handleReset = () => {
    console.log("Reset to All Clusters"); // 调试日志
    setSelectedCluster("All");
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box 
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ marginBottom: "20px" }}
      >
        <Header title="DASHBOARD" subtitle="Welcome to the dashboard" />
        
        <Button
          variant="contained"
          color="secondary"
          onClick={handleReset}
          sx={{
            backgroundColor: colors.secondary[500],
            color: colors.primary[100],
            padding: "10px 20px",
          }}
        >
          Reset
        </Button>
      </Box>
      

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1: Clock Graph */}
    <Box
      gridColumn="span 6"
      gridRow="span 6"
      backgroundColor={colors.primary[400]}
      padding="20px"
      sx={{
        display: "flex",
        flexDirection: "column",
        // justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Typography
        variant="h5"
        fontWeight="600"
        sx={{marginTop: "50px", marginBottom: "15px", textAlign: "center" }}
      >
        Clock Graph
      </Typography>
      
      <Box
        sx={{
          width: "100%",
          height: "100%",
          maxHeight: "500px",
          
        }}
      >
        
        <PolarCoordinatePlot
          isDashboard={true} 
          onClusterSelect={handleClusterSelect} />
      </Box>
    </Box>

    <Box
          gridColumn="span 6"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Histogram
          </Typography>
          <Box
            sx={{
              flex: 1,
              position: "relative",
            }}
          >
            <Histograms isDashboard={true} selectedCluster={selectedCluster} />
          </Box>

        </Box>

        {/* ROW: Scatter Plot */}
            <Box
              gridColumn="span 6"
              gridRow="span 2"
              backgroundColor={colors.primary[400]}
              padding="30px"
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%", // 容器高度自动填充
              }}
            >
              <Typography
                  variant="h5"
                  fontWeight="600"
                  sx={{ marginBottom: "15px" }}
                >
                  Scatter Plot (Durations in 200,000, without "others")
                </Typography>
                <Box
                  sx={{
                    flex: 1, // 自动调整高度以适应容器
                    position: "relative",
                  }}
                ></Box>
              <ScatterPlots selectedCluster={selectedCluster} isDashboard={true} />
            </Box>


        <Box
          gridColumn="span 6"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px"}}
          >
            Category Distribution for Clusters 0, 1, and 2
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around", // 让三个饼图均匀分布
              alignItems: "center",
              flex: 1, // 使容器内的饼图高度适配
            }}
          >
            <Box sx={{ flex: 1, position: "relative", maxWidth: "30%", cursor: "pointer" }}
              onClick={() => handleOpenModal(0)}
            >
              <CategoryPieCharts cluster={0} isDashboard={true}/>
            </Box>
            <Box sx={{ flex: 1, position: "relative", maxWidth: "30%", cursor: "pointer" }}
              onClick={() => handleOpenModal(1)}
            >
              <CategoryPieCharts cluster={1} isDashboard={true}/>
            </Box>
            <Box sx={{ flex: 1, position: "relative", maxWidth: "30%", cursor: "pointer" }}
              onClick={() => handleOpenModal(2)}
            >
              <CategoryPieCharts cluster={2} isDashboard={true}/>
            </Box>
          </Box>
        </Box>

        
  

          
      </Box>


      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "60%",
            height: "60%",
            backgroundColor: colors.primary[400],
            padding: "20px",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Cluster {modalCluster} Distribution
          </Typography>
          {modalCluster !== null && <CategoryPieCharts cluster={modalCluster} isDashboard={false}/>}
        </Box>
      </Modal>



    </Box>
  );
};

export default Dashboard;
