import React, { useState, useEffect } from "react";
import {
  Card, CardContent, Typography, Box,
  TextField, MenuItem, Grid, Alert, CircularProgress
} from "@mui/material";
import PieChart from "./Charts/PieChart";
import BarChart from "./Charts/BarChart";
import { openCostsDB } from "../lib/idb.module";

function Reports() {
  // State for filters (year, month, currency)
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    currency: "USD"
  });

  // State for monthly and yearly reports
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [yearlyReport, setYearlyReport] = useState(null);

  // State for exchange rates and loading flags
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(true);

  useEffect(() => {
    // Load exchange rates from localStorage URL
    async function loadRates() {
      const url = localStorage.getItem("exchangeRatesUrl");
      if (!url) return;
      try {
        const response = await fetch(url);

        if (response.status !== 200) {
          throw new Error("FetchError: Invalid status code");
        }

        const data = await response.json();
        setExchangeRates(data);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
    }
    loadRates();
  }, []);

  useEffect(() => {
    // Load both monthly and yearly reports
    async function loadReports() {
      if (!exchangeRates) return;

      setLoading(true);
      setMonthlyReport(null);
      setYearlyReport(null);

      try {
        const db = await openCostsDB("costsdb", 1);

        // Get monthly report for PieChart
        const monthData = await db.getReport(
          filters.year,
          filters.month,
          filters.currency,
          exchangeRates
        );

        if (!monthData || !monthData.costs || monthData.costs.length === 0) {
          setHasData(false);
        } else {
          setHasData(true);
          setMonthlyReport(monthData);
        }

        // Get yearly report for BarChart
        const yearData = await db.getYearlyReport(
          filters.year,
          filters.currency,
          exchangeRates
        );
        setYearlyReport(yearData);

      } catch (err) {
        console.error("Error loading reports:", err);
        setHasData(false);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [filters, exchangeRates]);

  // Update filters when user changes year/month/currency
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <Box>
      <Card sx={{ mb: 4, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom color="#00809D">
            Monthly Reports
          </Typography>

          {/* Filter controls */}
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <TextField
              label="Year"
              type="number"
              name="year"
              value={filters.year}
              onChange={handleChange}
              sx={{ minWidth: 120 }}
            />
            <TextField
              label="Month"
              type="number"
              name="month"
              value={filters.month}
              onChange={handleChange}
              sx={{ minWidth: 120 }}
            />
            <TextField
              select
              label="Currency"
              name="currency"
              value={filters.currency}
              onChange={handleChange}
              sx={{ minWidth: 150 }}
            >
              {["USD", "ILS", "GBP", "EURO"].map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Display logic for reports */}
      {!exchangeRates ? (
        <Alert severity="info">
          Loading exchange rates... Please set the URL in Settings.
        </Alert>
      ) : loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : !hasData ? (
        <Alert severity="warning">
          No expenses found for {filters.month}/{filters.year}.
        </Alert>
      ) : (
        <Grid container spacing={4} alignItems="stretch">
          <Grid item xs={12} md={3} lg={3}>
            {monthlyReport && <PieChart report={monthlyReport} rates={exchangeRates} />}
          </Grid>
          <Grid item xs={12} md={9} lg={9}>
            {yearlyReport && <BarChart report={yearlyReport} />}
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default Reports;
