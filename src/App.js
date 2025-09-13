import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material/styles";
import { CssBaseline, Container, GlobalStyles } from "@mui/material";
import Navbar from "./components/navbar";
import AddCostForm from "./components/add_cost_form";
import MonthlyReport from "./components/monthly_report";
import YearlyReport from "./components/yearly_report";
import Settings from "./components/settings";
import CostsManagement from "./components/costs_management";

let theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#00809D",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          margin: 0,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            margin: 0,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          },
        }}
      />
      <Router>
        <Navbar />
        <Container sx={{ py: 4 }}>
          <Routes>
            <Route path="/" element={<AddCostForm />} />
            <Route path="/costsManagement" element={<CostsManagement />} />
            <Route path="/monthlyReports" element={<MonthlyReport />} />
            <Route path="/yearlyReports" element={<YearlyReport />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
