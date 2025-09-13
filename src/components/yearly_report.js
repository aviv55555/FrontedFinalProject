import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, TextField, MenuItem } from "@mui/material";
import { openCostsDB } from "../lib/idb.module";
import BarChart from "./charts/bar_chart";
import currencySymbols from "../lib/utils";

function YearlyReport() {
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
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

    // Load yearly report from IndexedDB
    async function loadReport() {
      const db = await openCostsDB("costsdb", 1);
      const r = await db.getYearlyReport(filters.year, filters.currency, rates);
      setReport(r);
    }
    loadReport();
  }, [filters, rates]);

  return (
    <Card sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <CardContent>
        <Typography variant="h4" gutterBottom sx={{ color: "#00809D" }}>
          Yearly Report
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          {/* Input field for year filter */}
          <TextField
            label="Year"
            type="number"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}
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

        {/* Show chart if report exists, otherwise show fallback message */}
        {!report ? (
          <Typography variant="body2" color="textSecondary">
            No data available to display
          </Typography>
        ) : (
          <BarChart report={report} />
        )}
      </CardContent>
    </Card>
  );
}

export default YearlyReport;
