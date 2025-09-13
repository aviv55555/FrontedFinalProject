import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    // Main navigation bar at the top of the application
    <AppBar position="static" sx={{ backgroundColor: "#00809D" }}>
      <Toolbar>
        {/* Application title aligned to the left */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Cost Manager
        </Typography>

        {/* Navigation buttons using React Router links */}
        <Button color="inherit" component={Link} to="/">
          Add Cost
        </Button>
        <Button color="inherit" component={Link} to="/costsManagement">
          Costs Management
        </Button>
        <Button color="inherit" component={Link} to="/monthlyReports">
          Monthly Reports
        </Button>
         <Button color="inherit" component={Link} to="/yearlyReports">
          Yearly Reports
        </Button>
        <Button color="inherit" component={Link} to="/settings">
          Settings
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
