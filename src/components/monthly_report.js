import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, TextField, MenuItem } from "@mui/material";
import { openCostsDB } from "../lib/idb.module";
import PieChart from "./charts/pie_chart";
import currencySymbols from "../lib/utils";

function MonthlyReport() {
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    currency: "USD"
  });
  const [report, setReport] = useState(null);
  const [rates, setRates] = useState(null);

  useEffect(() => {
    const url = localStorage.getItem("exchangeRatesUrl");
    if (!url) return;

    // Fetch exchange rates with validation
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch exchange rates");
        return res.json();
      })
      .then(setRates)
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!rates) return;

    // Load monthly report from IndexedDB
    async function loadReport() {
      const db = await openCostsDB("costsdb", 1);
      const r = await db.getReport(filters.year, filters.month, filters.currency, rates);
      setReport(r);
    }
    loadReport();
  }, [filters, rates]);

  // Check if there are costs to display
  const hasData = report && report.costs && report.costs.length > 0;

  return (
    <Card sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <CardContent>
        <Typography variant="h4" gutterBottom sx={{ color: "#00809D" }}>
          Monthly Report
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          {/* Input field for year filter */}
          <TextField
            label="Year"
            type="number"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}
          />

          {/* Input field for month filter */}
          <TextField
            label="Month"
            type="number"
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: Number(e.target.value) })}
          />

          {/* Dropdown for currency filter */}
          <TextField
            select
            label="Currency"
            value={filters.currency}
            onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
            sx={{ minWidth: 150 }}
          >
            {["USD", "ILS", "GBP", "EURO"].map((c) => (
              <MenuItem key={c} value={c}>
                {c} ({currencySymbols[c]})
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Show chart if data exists, otherwise show fallback message */}
        {!hasData ? (
          <Typography variant="body2" color="red">
            No data available to display
          </Typography>
        ) : (
          <PieChart report={report} rates={rates} />
        )}
      </CardContent>
    </Card>
  );
}

export default MonthlyReport;
