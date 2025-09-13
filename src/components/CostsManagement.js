import React, { useState, useEffect } from "react";
import {
  Card, CardContent, Typography,
  TextField, IconButton, Table, TableHead,
  TableRow, TableCell, TableBody, Button, MenuItem, Box
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { openCostsDB } from "../lib/idb.module";
import currencySymbols from "../lib/utils";

function CostsManagement() {
  const [costs, setCosts] = useState([]);
  const [search, setSearch] = useState("");

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear().toString());
  const [month, setMonth] = useState((today.getMonth() + 1).toString());

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    sum: "",
    currency: "USD",
    category: "",
    description: ""
  });

  // Load all costs from DB
  const loadCosts = async () => {
    const db = await openCostsDB("costsdb", 1);
    const all = await db.getAllCosts();
    setCosts(all);
  };

  useEffect(() => {
    loadCosts();
  }, []);

  // Delete cost
  const handleDelete = async (id) => {
    const db = await openCostsDB("costsdb", 1);
    await db.deleteCost(id);
    loadCosts();
  };

  // Start editing
  const handleEditStart = (cost) => {
    setEditingId(cost.id);
    setEditForm({
      sum: cost.sum,
      currency: cost.currency,
      category: cost.category,
      description: cost.description
    });
  };

  // Save edited cost
  const handleEditSave = async () => {
    const db = await openCostsDB("costsdb", 1);
    const original = costs.find((c) => c.id === editingId);

    await db.updateCost({
      id: editingId,
      ...editForm,
      date: original.date // keep original date
    });

    setEditingId(null);
    setEditForm({ sum: "", currency: "USD", category: "", description: "" });
    loadCosts();
  };

  // Filter costs by search + year + month
  const filteredCosts = costs.filter((c) => {
    const matchesSearch =
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());

    const costDate = new Date(c.date);
    const matchesYear = year ? costDate.getFullYear() === Number(year) : true;
    const matchesMonth = month ? costDate.getMonth() + 1 === Number(month) : true;

    return matchesSearch && matchesYear && matchesMonth;
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom sx={{ color: "#00809D" }}>
          Manage Costs
        </Typography>

        {/* Filters: Year + Month + Search */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            sx={{ width: 120 }}
          />
          <TextField
            label="Month"
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            sx={{ width: 120 }}
          />
          <TextField
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
        </Box>

        {/* Table or message */}
        {filteredCosts.length === 0 ? (
          <Typography variant="body1" color="error">
            No expenses found for this {month ? "month" : "year"}.
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sum</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCosts.map((cost) => (
                <TableRow key={cost.id}>
                  {/* Sum */}
                  <TableCell>
                    {editingId === cost.id ? (
                      <TextField
                        type="number"
                        value={editForm.sum}
                        onChange={(e) =>
                          setEditForm({ ...editForm, sum: Number(e.target.value) })
                        }
                        size="small"
                      />
                    ) : (
                      `${currencySymbols[cost.currency]}${cost.sum}`
                    )}
                  </TableCell>

                  {/* Currency */}
                  <TableCell>
                    {editingId === cost.id ? (
                      <TextField
                        select
                        value={editForm.currency}
                        onChange={(e) =>
                          setEditForm({ ...editForm, currency: e.target.value })
                        }
                        size="small"
                      >
                        {["USD", "ILS", "GBP", "EURO"].map((c) => (
                          <MenuItem key={c} value={c}>
                            {c} ({currencySymbols[c]})
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      cost.currency
                    )}
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    {editingId === cost.id ? (
                      <TextField
                        value={editForm.category}
                        onChange={(e) =>
                          setEditForm({ ...editForm, category: e.target.value })
                        }
                        size="small"
                      />
                    ) : (
                      cost.category
                    )}
                  </TableCell>

                  {/* Description */}
                  <TableCell>
                    {editingId === cost.id ? (
                      <TextField
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({ ...editForm, description: e.target.value })
                        }
                        size="small"
                      />
                    ) : (
                      cost.description
                    )}
                  </TableCell>

                  {/* Date */}
                  <TableCell>{new Date(cost.date).toLocaleDateString()}</TableCell>

                  {/* Actions */}
                  <TableCell>
                    {editingId === cost.id ? (
                      <>
                        <Button
                          onClick={handleEditSave}
                          size="small"
                          color="success"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingId(null)}
                          size="small"
                          color="error"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <IconButton
                          onClick={() => handleEditStart(cost)}
                          sx={{ color: "#00809D" }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(cost.id)}
                          sx={{ color: "#00809D" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default CostsManagement;
