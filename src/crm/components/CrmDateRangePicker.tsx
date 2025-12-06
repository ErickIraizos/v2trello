import { useState } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  ...theme.applyStyles("dark", {
    backgroundColor: "transparent",
    border: `1px solid ${theme.palette.divider}`,
  }),
}));

const dateRanges = [
  { label: "Hoy", value: "today" },
  { label: "Ayer", value: "yesterday" },
  { label: "Esta Semana", value: "thisWeek" },
  { label: "Semana Pasada", value: "lastWeek" },
  { label: "Este Mes", value: "thisMonth" },
  { label: "Mes Pasado", value: "lastMonth" },
  { label: "Este Trimestre", value: "thisQuarter" },
  { label: "Trimestre Pasado", value: "lastQuarter" },
  { label: "Este Año", value: "thisYear" },
  { label: "Rango Personalizado", value: "custom" },
];

export default function CrmDateRangePicker() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRange, setSelectedRange] = useState(dateRanges[4]);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [customLabel, setCustomLabel] = useState<string | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRangeSelect = (range: (typeof dateRanges)[0]) => {
    if (range.value === "custom") {
      setCustomDialogOpen(true);
      handleClose();
    } else {
      setSelectedRange(range);
      setCustomLabel(null);
      handleClose();
    }
  };

  const handleCustomDateConfirm = () => {
    if (startDate && endDate) {
      const label = `${startDate.format("DD/MM/YY")} - ${endDate.format("DD/MM/YY")}`;
      setCustomLabel(label);
      setSelectedRange({ label: "Personalizado", value: "custom" });
    }
    setCustomDialogOpen(false);
  };

  const displayLabel = customLabel || selectedRange.label;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <div>
        <StyledButton
          id="date-range-button"
          aria-controls={open ? "date-range-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          endIcon={<ArrowDropDownRoundedIcon />}
          startIcon={<CalendarTodayRoundedIcon />}
          size="small"
        >
          {displayLabel}
        </StyledButton>
        <Menu
          id="date-range-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "date-range-button",
          }}
        >
          {dateRanges.map((range) => (
            <MenuItem
              key={range.value}
              onClick={() => handleRangeSelect(range)}
              selected={range.value === selectedRange.value && !customLabel}
            >
              {range.label}
            </MenuItem>
          ))}
        </Menu>

        <Dialog open={customDialogOpen} onClose={() => setCustomDialogOpen(false)} maxWidth="md">
          <DialogTitle>Seleccionar Rango de Fechas</DialogTitle>
          <DialogContent>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ pt: 1 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Fecha de Inicio
                </Typography>
                <DateCalendar
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  maxDate={endDate || undefined}
                />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Fecha de Fin
                </Typography>
                <DateCalendar
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  minDate={startDate || undefined}
                />
              </Stack>
            </Stack>
            {startDate && endDate && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
                Rango seleccionado: {startDate.format("DD MMMM YYYY")} - {endDate.format("DD MMMM YYYY")}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCustomDateConfirm} variant="contained" disabled={!startDate || !endDate}>
              Aplicar
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
}
