import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, TextField, MenuItem } from "@mui/material";
import { openCostsDB } from "../lib/idb.module";
import PieChart from "./Charts/PieChart";
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
    fetch(url).then(res => res.json()).then(setRates);
  }, []);

  useEffect(() => {
    if (!rates) return;
    async function loadReport() {
      const db = await openCostsDB("costsdb", 1);
      const r = await db.getReport(filters.year, filters.month, filters.currency, rates);
      setReport(r);
    }
    loadReport();
  }, [filters, rates]);

  return (
    <Card sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <CardContent>
        <Typography variant="h4" gutterBottom sx={{ color: "#00809D" }}>
          Monthly Report
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Year"
            type="number"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}
          />
          <TextField
            label="Month"
            type="number"
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: Number(e.target.value) })}
          />
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
        {report && <PieChart report={report} rates={rates} />}
      </CardContent>
    </Card>
  );
}

export default MonthlyReport;
