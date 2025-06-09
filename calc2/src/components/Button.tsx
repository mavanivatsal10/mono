import type { JSX } from "react";

export default function Button({
  displayVal,
  onClick,
  classes,
  variant,
  ref,
}: {
  displayVal: string | JSX.Element;
  classes?: string;
  onClick: () => void;
  variant: "dark" | "light" | "orange";
  ref?: any;
}) {
  let variantStyle = "";
  if (variant === "dark") {
    variantStyle = "bg-gray-800 hover:bg-gray-700";
  } else if (variant === "light") {
    variantStyle = "bg-gray-700 hover:bg-gray-800";
  } else if (variant === "orange") {
    variantStyle = "bg-amber-500 hover:bg-amber-600";
  }
  return (
    <button
      type="button"
      className={`flex items-center justify-center ${classes} ${variantStyle} transition-colors duration-100 ease-in-out text-white rounded-sm p-4 text-lg shadow-md`}
      onClick={onClick}
      ref={ref}
    >
      {displayVal}
    </button>
  );
}
