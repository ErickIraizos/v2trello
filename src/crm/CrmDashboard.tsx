import * as React from "react";
import { Outlet, Routes, Route } from "react-router-dom";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-data-grid-pro/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import CrmAppNavbar from "./components/CrmAppNavbar";
import CrmHeader from "./components/CrmHeader";
import CrmSideMenu from "./components/CrmSideMenu";
import CrmMainDashboard from "./components/CrmMainDashboard";
import Users from "./pages/Users";
import Tables from "./pages/Tables";
import Schedule from "./pages/Schedule";
import History from "./pages/History";
import Lists from "./pages/Lists";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import AppTheme from "../shared-theme/AppTheme";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../dashboard/theme/customizations";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function CrmDashboard() {
  return (
    <AppTheme themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <CrmSideMenu />
        <CrmAppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <CrmHeader />
            <Routes>
              <Route index element={<CrmMainDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="tables" element={<Tables />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="history" element={<History />} />
              <Route path="lists" element={<Lists />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />
            </Routes>
            <Outlet />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
