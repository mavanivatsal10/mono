import { Card, CardContent, Box, Typography } from "@mui/material";

export default function Card1({
  iconSrc,
  text,
  alt,
}: {
  iconSrc?: string;
  text?: string;
  alt: string;
}) {
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        bgcolor: "grey.100",
        borderRadius: 2,
        minHeight: 128,
        maxHeight: 250,
        height: "100%",
      }}
      elevation={0}
    >
      <CardContent sx={{ p: 0, overflow: "auto", minHeight: 0 }}>
        <Box
          sx={{
            bgcolor: "white",
            height: 64,
            width: 64,
            borderRadius: 1,
            p: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={iconSrc} alt={alt} />
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>{text}</Typography>
      </CardContent>
    </Card>
  );
}
