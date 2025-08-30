import React, { useState } from "react";
import { Card, CardContent, Typography, TextField, Button, MenuItem, Box } from "@mui/material";
import { openCostsDB } from "../lib/idb.module"; 

function AddCostForm() {
  const [form, setForm] = useState({
    sum: "",
    currency: "USD",
    category: "",
    description: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const db = await openCostsDB("costsdb", 1); 
      await db.addCost({
        sum: Number(form.sum),
        currency: form.currency,
        category: form.category,
        description: form.description
      });

      alert("Cost added successfully!");

      setForm({ sum: "", currency: "USD", category: "", description: "" });
    } catch (error) {
      console.error("Error adding cost:", error);
      alert("Failed to add cost");
    }
  };

  return (
    <Card sx={{ maxWidth: 500, margin: "auto" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="#00809D">
          Add New Cost
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Sum"
            name="sum"
            type="number"
            value={form.sum}
            onChange={handleChange}
            required
          />

          <TextField
            select
            label="Currency"
            name="currency"
            value={form.currency}
            onChange={handleChange}
          >
            {["USD", "ILS", "GBP", "EURO"].map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />

          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />

          <Button type="submit" variant="contained" sx={{ backgroundColor: "#00809D", color: "white" }}
>
            Add Cost
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default AddCostForm;
