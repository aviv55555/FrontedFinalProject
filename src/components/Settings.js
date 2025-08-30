import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, TextField, Button, Box } from "@mui/material";

function Settings() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const savedUrl = localStorage.getItem("exchangeRatesUrl");
    if (savedUrl) {
      setUrl(savedUrl);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("exchangeRatesUrl", url);
    setStatus("URL saved successfully!");
    setTimeout(() => setStatus(""), 3000);
  };

  const handleTest = async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network error");
      const data = await response.json();
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
        <Typography variant="h5" gutterBottom>
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
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
            <Button variant="outlined" onClick={handleTest}>
              Test URL
            </Button>
          </Box>

          {status && <Typography>{status}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}

export default Settings;
