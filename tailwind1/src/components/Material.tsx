import { Box, Container, Grid } from "@mui/material";
import Heading from "./materialComp/Heading";
import Card1 from "./materialComp/Card1";
import Card2 from "./materialComp/Card2";
import ImageComp from "./materialComp/ImageComp";
import QuoteForm from "./materialComp/QuoteForm";

export default function Material() {
  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        py: 8,
        px: 4,
        mx: "auto",
      }}
    >
      <Heading text="How get quote service works" />
      <Grid container spacing={2}>
        {[
          {
            iconSrc: "../public/flowers.jpg",
            text: "Get Quotes / 24/7 Customer Support",
          },
          {
            iconSrc: "../public/vite.svg",
            text: "Get Quotes / 24/7 Customer Support. mmmmmmmm mmmmmm mmmmmmmmm mmmmmmm mmmmmmm mmmmmmmmmmmm mmmmmm mmmmmmmmm mmmmmm mmmmmmmmm mmmmmmm",
          },
          {
            iconSrc: "../public/flowers.jpg",
            text: "Get Quotes / 24/7 Customer Support",
          },
          {
            iconSrc: "../public/vite.svg",
            text: "Get Quotes / 24/7 Customer Support",
          },
        ].map((item, index) => (
          <Grid item size={{ md: 3, xs: 6 }} key={index}>
            <Card1 iconSrc={item.iconSrc} text={item.text} alt="click" />
          </Grid>
        ))}
      </Grid>
      <Heading text="Get quote steps" />
      <Grid
        container
        spacing={6}
        sx={{
          px: 8,
        }}
      >
        {[
          {
            imgSrc: "../public/flowers.jpg",
            heading: "Visit the “Get Quote” Page",
            text: "Enter your details and select the desired service. mmmmmmmmmmmm mmmmmm mmmmmmmmm mmmmmmm mmmmmmm mmmmmmmmmmmmmmmm mmmmmmmmmm mmmmmmmmmmmm mmmmmm mmmmmmmmm mmmmmmm mmmmmmmmmmmm mmmmmm mmmmmmmmm mmmmmmm mmmmmmm mmmmmmmmmmmmmmmm mmmmmmmmmm mmmmmmmmmmmm mmmmmm mmmmmmmmm mmmmmmm",
          },
          {
            imgSrc: "../public/vite.svg",
            heading: "Enter Your Details",
            text: "Enter your details and select the desired service. ",
          },
          {
            imgSrc: "../public/flowers.jpg",
            heading: "Receive a Quote",
            text: "Enter your details and select the desired service. ",
          },
          {
            imgSrc: "../public/vite.svg",
            heading: "Receive a Quote",
            text: "Enter your details and select the desired service. ",
          },
          {
            imgSrc: "../public/flowers.jpg",
            heading: "Receive a Quote",
            text: "Enter your details and select the desired service. mmm mmmmmmmmmm mmmmmmmmmmmm mmmmmm mmmmmmmmm mmmmmmm",
          },
          {
            imgSrc: "../public/vite.svg",
            heading: "Receive a Quote",
            text: "Enter your details and select the desired service. ",
          },
          {
            imgSrc: "../public/flowers.jpg",
            heading: "Receive a Quote",
            text: "Enter your details and select the desired service. ",
          },
          {
            imgSrc: "../public/vite.svg",
            heading: "Receive a Quote",
            text: "Enter your details and select the desired service. ",
          },
        ].map((item, index) => (
          <Grid item size={{ lg: 3, md: 4, sm: 6, xs: 12 }} key={index}>
            <Card2 key={index} {...item} alt="click" />
          </Grid>
        ))}
      </Grid>
      <ImageComp />
      <Heading text="Get quote" />
      <QuoteForm />
    </Container>
  );
}
