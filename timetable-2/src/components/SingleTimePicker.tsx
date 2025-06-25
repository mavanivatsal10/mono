import Box from "@mui/material/Box";
import { TimePicker } from "@mui/x-date-pickers";
import { Controller } from "react-hook-form";

export default function SingleTimePicker({ form, title, fieldName }) {
  const time = form.watch(fieldName);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {title}
      </Box>
      <Controller
        name={fieldName}
        control={form.control}
        render={({ field }) => <TimePicker {...field} />}
      />
    </Box>
  );
}
