import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, TextField, Button, Box } from "@mui/material";

function Settings() {
  // State for storing the URL from settings
  const [url, setUrl] = useState("");
  // State for status messages shown to the user
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Load saved URL from localStorage when the component mounts
    const savedUrl = localStorage.getItem("exchangeRatesUrl");
    if (savedUrl) {
      setUrl(savedUrl);
    }
  }, []);

  // Save the current URL to localStorage
  const handleSave = () => {
    localStorage.setItem("exchangeRatesUrl", url);
    setStatus("URL saved successfully!");
    setTimeout(() => setStatus(""), 3000);
  };

  // Test the URL by fetching data and validating the structure
  const handleTest = async () => {
    try {
      const response = await fetch(url);

      // Validate response status
      if (!response.ok) {
        throw new Error(`FetchError: Invalid status code ${response.status}`);
      }

      const data = await response.json();

      // Validate the returned JSON structure (should contain these currencies)
      if (data.USD && data.GBP && data.EURO && data.ILS) {
        setStatus("URL is valid and returned exchange rates!");
      } else {
        setStatus("URL returned invalid format.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Failed to fetch exchange rates.");
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: "auto" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="#00809D">
          Settings
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Exchange Rates URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            fullWidth
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{ backgroundColor: "#00809D", color: "white" }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={handleTest}
              sx={{ borderColor: "#00809D", color: "#00809D" }}
            >
              Test URL
            </Button>
          </Box>

          {/* Show status message if exists */}
          {status && <Typography>{status}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}

export default Settings;
