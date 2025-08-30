import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

// Register required chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart({ report }) {
  // Array of month labels for the x-axis
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  // Data object for chart.js Bar chart
  const data = {
    labels: months,
    datasets: [
      {
        label: `Year ${report.year} in ${report.currency}`,
        data: report.monthlyTotals,
        backgroundColor: "#00809D"
      }
    ]
  };

  // Options for chart.js configuration
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" }
    },
    scales: {
      y: { beginAtZero: true } 
    }
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ height: "100%" }}>
        <Typography variant="h6">Bar Chart – Costs by Month</Typography>
        <Box sx={{ width: "750px", height: "400px" }}>
          {/* Render bar chart with data and options */}
          <Bar data={data} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
}

export default BarChart;
