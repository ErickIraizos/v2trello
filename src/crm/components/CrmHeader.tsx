import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ColorModeIconDropdown from "../../shared-theme/ColorModeIconDropdown";
import CrmSearch from "./CrmSearch";
import CrmNavbarBreadcrumbs from "./CrmNavbarBreadcrumbs";
import CrmDateRangePicker from "./CrmDateRangePicker";
import NotificationBell from "./NotificationBell";

export default function CrmHeader() {
  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: "none", md: "flex" },
        width: "100%",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        maxWidth: { sm: "100%", md: "1700px" },
        pt: 1.5,
      }}
      spacing={2}
    >
      <Stack direction="column" spacing={1}>
        <CrmNavbarBreadcrumbs />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Panel de Tareas
        </Typography>
      </Stack>
      <Stack direction="row" sx={{ gap: 1 }}>
        <CrmSearch />
        <CrmDateRangePicker />
        <NotificationBell />
        <ColorModeIconDropdown />
      </Stack>
    </Stack>
  );
}
