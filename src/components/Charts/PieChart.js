import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({ report, rates }) {
  const categories = {};
  const targetCurrency = report.total.currency;
  const targetRate = rates?.[targetCurrency] || 1;

  report.costs.forEach(c => {
    const sourceRate = rates?.[c.currency] || 1;
    const convertedSum = c.sum * (targetRate / sourceRate);

    categories[c.category] = (categories[c.category] || 0) + convertedSum;
  });

  const data = {
    labels: Object.keys(categories),
    datasets: [
      {
        label: `Costs in ${targetCurrency}`,
        data: Object.values(categories),
        backgroundColor: [
          "#42a5f5", "#66bb6a", "#ffca28", "#ef5350", "#ab47bc"
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ height: "100%" }}>
        <Typography variant="h6">Pie Chart – Costs by Category</Typography>
        <Box sx={{ height: "400px", width: "100%" }}>
          <Pie data={data} />
        </Box>
      </CardContent>
    </Card>
  );
}

export default PieChart;
