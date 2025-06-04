import {
  Box,
  Grid,
  Stack,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { amber } from "@mui/material/colors";
import { Upload } from "lucide-react";

export default function ImageComp() {
  return (
    <Grid container spacing={2}>
      <Grid item size={{ md: 6, xs: 12 }}>
        <Box
          component="img"
          src="../public/flowers.jpg"
          sx={{
            height: 350,
            width: "100%",
            borderRadius: 8,
            objectFit: "cover",
          }}
        />
      </Grid>
      <Grid
        item
        size={{ md: 6, xs: 12 }}
        sx={{
          py: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h4">
            Get Quotes / <br />
            24/7 Customer Support
          </Typography>
          <Typography variant="body1">
            Our team serves as your digital front desk, handling guest
            inquiries, Our team serves as your digital front desk, handling
            guest inquiries, Our team serves as your digital front desk,
            handling guest inquiries
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              sx={{
                bgcolor: amber[800],
                fontSize: 12,
                fontWeight: 600,
                py: 1,
                px: 2,
                borderRadius: 2,
                textTransform: "uppercase",
              }}
              disableElevation={true}
            >
              Create New
            </Button>
            <IconButton sx={{ bgcolor: "black", borderRadius: 2, px: 1.5 }}>
              <Upload className="h-4 w-4 text-white" />
            </IconButton>
            <Typography
              variant="body1"
              sx={{
                color: amber[800],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Talk to Contact
            </Typography>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}
