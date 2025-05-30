import { useEffect, useRef, useState } from "react";
import Button from "./button";

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
      if (cardRef.current.offsetHeight >= 288) {
        setIsTall(true);
      } else {
        setIsTall(false);
      }
    }
  }, [cardRef.current?.offsetHeight]);

  return (
    <div
      ref={cardRef}
      className="flex flex-col bg-gray-100 m-2 space-y-2 px-2 py-6 min-h-48 max-h-72 overflow-auto rounded-xl items-center  text-center relative"
    >
      <img src={imgSrc} className="h-8 w-8 rounded-md" alt={alt} />
      <h3 className="text-orange-400 font-semibold">{heading}</h3>
      <p className="text-xs mb-10">{text}</p>
      <Button
        text="create new"
        color="orange-400"
        classes={isTall ? "" : "absolute bottom-4"}
      />
    </div>
  );
}
