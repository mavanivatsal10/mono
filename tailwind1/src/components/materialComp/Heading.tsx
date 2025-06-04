import { Box, Typography } from "@mui/material";

export default function Heading({ text }: { text: string }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Typography
        variant="h4"
        align="center"
        sx={{
          fontWeight: 600,
          fontFamily: "Poppins",
          my: 2,
        }}
      >
        {text}
      </Typography>
      <Box
        sx={{
          height: "2px",
          backgroundColor: "orange",
          width: "5%",
          mb: 2,
        }}
      />
    </Box>
  );
}
