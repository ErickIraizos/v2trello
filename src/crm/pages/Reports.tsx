import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Reports() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Página de Reportes
      </Typography>
      <Typography paragraph>
        Esta es la página de reportes donde puede acceder y generar varios
        análisis e información.
      </Typography>
    </Box>
  );
}
