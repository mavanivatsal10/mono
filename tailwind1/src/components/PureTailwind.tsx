import Card1 from "./Card1";
import Card2 from "./Card2";
import Heading from "./Heading";
import ImageComp from "./ImageComp";
import QuatationForm from "./QuotationForm";

export default function PureTailwind() {
  return (
    <div className="flex flex-col space-y-16 py-12 px-4 max-w-7xl mx-auto">
      {/** how get quote service works */}
      <Heading text="How get quote service works" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            iconSrc: "../public/flowers.jpg",
            text: "Get Quotes / 24/7 Customer Support",
          },
          {
            iconSrc: "../public/vite.svg",
            text: "Get Quotes / 24/7 Customer Support. mmmmmmmmmmmm mmmmmm mmmmmmmmm mmmmmmm mmmmmmm mmmmmmmmmmmmmmmm mmmmmmmmmm mmmmmmmmmmmm mmmmmm mmmmmmmmm mmmmmmm",
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
          <Card1
            key={index}
            iconSrc={item.iconSrc}
            text={item.text}
            alt="click"
          />
        ))}
      </div>
      <Heading text="Get quote steps" />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <Card2 key={index} {...item} alt="click" />
        ))}
      </div>
      <ImageComp />
      <Heading text="Quotation Form" />
      <QuatationForm />
    </div>
  );
}
