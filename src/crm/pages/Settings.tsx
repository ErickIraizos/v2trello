import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Settings() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Página de Configuración
      </Typography>
      <Typography paragraph>
        Esta es la página de configuración donde puede configurar sus preferencias de CRM
        y administrar su cuenta.
      </Typography>
    </Box>
  );
}
