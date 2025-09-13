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
import currencySymbols from "../../lib/utils";

// Register required chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart({ report }) {
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];
  
  const monthlyTotals = Array.isArray(report.monthlyTotals)
    ? report.monthlyTotals
    : Array.from({ length: 12 }, () => 0);

  const data = {
    labels: months,
    datasets: [
      {
        label: `Year ${report.year} in ${report.currency} (${currencySymbols[report.currency] || ""})`,
        data: monthlyTotals,
        backgroundColor: "#00809D"
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };
  // Check if there's any non-zero value in monthlyTotals
  const hasData = monthlyTotals.some((v) => v > 0);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ height: "100%" }}>
        <Typography variant="h6" sx={{ color: "#00809D" }}>
          Bar Chart – Costs by Month
        </Typography>
        <Box sx={{ width: "750px", height: "400px" }}>
          {hasData ? (
            <Bar data={data} options={options} />
          ) : (
            <Typography variant="body2" color="red" sx={{ mt: 2 }}>
              No data available to display
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default BarChart;
