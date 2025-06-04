import { useEffect, useRef, useState } from "react";
import { Box, Card, Typography, Button as MuiButton } from "@mui/material";
import { amber } from "@mui/material/colors";

export default function Card2({
  imgSrc,
  heading,
  text,
  alt,
}: {
  imgSrc: string;
  heading: string;
  text: string;
  alt: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isTall, setIsTall] = useState(false);

  useEffect(() => {
    if (cardRef.current) {
      setIsTall(cardRef.current.offsetHeight >= 140);
    }
  }, [cardRef.current?.offsetHeight]);

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.300",
        m: 0,
        p: 3,
        minHeight: 192,
        maxHeight: 288,
        height: "100%",
        overflow: "auto",
        borderRadius: 3,
        alignItems: "center",
        textAlign: "center",
        position: "relative",
      }}
      elevation={0}
    >
      <Box
        component="img"
        src={imgSrc}
        alt={alt}
        sx={{ height: 32, width: 32, borderRadius: 1, mb: 1 }}
      />
      <Typography variant="h6" sx={{ px: 1, color: amber[800] }}>
        {heading}
      </Typography>
      <Typography variant="body2" ref={cardRef} sx={{ fontSize: 12, mb: 5 }}>
        {text}
      </Typography>
      <MuiButton
        variant="contained"
        sx={{
          bgcolor: amber[800],
          fontSize: 12,
          fontWeight: 600,
          py: 1,
          px: 2,
          borderRadius: 2,
          position: isTall ? "static" : "absolute",
          bottom: isTall ? "auto" : 16,
          textTransform: "uppercase",
        }}
        disableElevation={true}
      >
        Create New
      </MuiButton>
    </Card>
  );
}
