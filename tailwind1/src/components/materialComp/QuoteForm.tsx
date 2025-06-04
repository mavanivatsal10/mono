import { Box, Button, Grid, Stack, TextField, Typography } from "@mui/material";
import { amber } from "@mui/material/colors";
import { Upload } from "lucide-react";

export default function QuoteForm() {
  return (
    <Grid container spacing={4}>
      <Grid
        item
        size={{ md: 8, xs: 12 }}
        spacing={20}
        sx={{ bgcolor: "grey.100", borderRadius: 4, p: 4 }}
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="body">
              Get Quotes / 24/7 Customer Support -{" "}
            </Typography>
            <Typography variant="body" sx={{ color: amber[800] }}>
              now
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Name"
              variant="outlined"
              size="small"
              sx={{ flex: 1 }}
              InputProps={{ style: { borderRadius: 10, width: "100%" } }}
            />
            <TextField
              label="Last Name"
              variant="outlined"
              size="small"
              sx={{ flex: 1 }}
              InputProps={{ style: { borderRadius: 10, width: "100%" } }}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Email"
              variant="outlined"
              size="small"
              sx={{ flex: 1 }}
              InputProps={{ style: { borderRadius: 10, width: "100%" } }}
            />
            <TextField
              label="Phone"
              variant="outlined"
              size="small"
              sx={{ flex: 1 }}
              InputProps={{ style: { borderRadius: 10, width: "100%" } }}
            />
          </Stack>
          <TextField
            label="Address"
            variant="outlined"
            size="small"
            sx={{ flex: 1 }}
            InputProps={{ style: { borderRadius: 10, width: "100%" } }}
          />
          <TextField
            multiline
            rows={4}
            label="Phone"
            variant="outlined"
            size="small"
            sx={{ flex: 1 }}
            InputProps={{ style: { borderRadius: 10, width: "100%" } }}
          />
          <Button
            sx={{
              borderRadius: 4,
              bgcolor: "white",
              border: "1px dashed grey",
              color: "black",
              height: 80,
            }}
          >
            <Stack direction="row" spacing={2}>
              <Upload />
              <Typography variant="body">Get Quote</Typography>
            </Stack>
          </Button>
          <Typography variant="body" sx={{ color: "grey", fontWeight: 400 }}>
            * file size should not exceed 2 MB
          </Typography>
          <Button
            sx={{
              borderRadius: 2,
              bgcolor: amber[800],
              color: "white",
              width: 100,
            }}
          >
            SUBMIT
          </Button>
        </Stack>
      </Grid>
      <Grid
        item
        size={{ md: 4, xs: 12 }}
        sx={{ bgcolor: "grey.100", borderRadius: 4, p: 4 }}
      ></Grid>
    </Grid>
  );
}
