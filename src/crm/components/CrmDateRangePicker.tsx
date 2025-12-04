import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";

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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRange, setSelectedRange] = React.useState(dateRanges[4]); // Default to "This Month"
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRangeSelect = (range: (typeof dateRanges)[0]) => {
    setSelectedRange(range);
    handleClose();
  };

  return (
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
        {selectedRange.label}
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
            selected={range.value === selectedRange.value}
          >
            {range.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
