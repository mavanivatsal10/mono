import { useRef, useState } from "react";
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function App() {
  const [state, setState] = useState({
    productTitle: null,
    productType: null,
    productStatus: null,
    taxBracket: null,
    sku: null,
    shortDescription: "",
    longDescription: "",
    productImages: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const productTitleOptions = [
    { value: "milk", label: "Milk" },
    { value: "mayo", label: "Mayo" },
    { value: "cheese", label: "Cheese" },
  ];

  const productTypeOptions = [
    { value: "dairy", label: "Dairy" },
    { value: "snack", label: "Snack" },
  ];

  const productStatusOptions = [
    { value: "available", label: "Available" },
    { value: "unavailable", label: "Unavailable" },
  ];

  const taxBracketOptions = [
    { value: "12", label: "12%" },
    { value: "18", label: "18%" },
    { value: "28", label: "28%" },
  ];

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setState((prevState) => ({
        ...prevState,
        productImages: [...prevState.productImages, ...newImages],
      }));
    }
  };

  return (
    <div className="p-4">
      {/** Product Image */}
      <h1 className="text-2xl font-bold mt-4">Product Photo</h1>
      <div className="flex gap-4">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={handleImageUpload}
        />
        {state.productImages.length > 0
          ? state.productImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt="Product"
                className="w-20 h-20 object-cover rounded-md border-2 border-gray-400"
              />
            ))
          : null}
        <button
          className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center flex-col border-2 border-dashed border-gray-400 hover:bg-gray-300 transition duration-200"
          onClick={() => inputRef.current?.click()}
        >
          <div className="text-3xl text-gray-500">+</div>
          <div className="text-gray-500">Add</div>
        </button>
      </div>
      {/** Basic Details */}
      <h1 className="text-2xl font-bold mt-4">Basic Details</h1>
      <div>
        <form className="flex flex-col gap-4">
          {/** product title */}
          <div className="mt-4">
            <label htmlFor="productTitle">
              <span className="font-bold">Product Title </span>
              <span className="text-red-500">*</span>
            </label>
            <Select
              options={productTitleOptions}
              placeholder="Select a product to buy"
              value={state.productTitle}
              onChange={(selectedOption) => {
                setState({ ...state, productTitle: selectedOption });
              }}
            />
          </div>
          {/** product type */}
          <div>
            <label htmlFor="productType">
              <span className="font-bold">Product Type </span>
              <span className="text-red-500">*</span>
            </label>
            <Select
              options={productTypeOptions}
              placeholder="Select a product ty[e"
              value={state.productType}
              onChange={(selectedOption) => {
                setState({ ...state, productType: selectedOption });
              }}
            />
          </div>
          {/** 2 columns */}
          <div className="flex gap-4 w-full">
            {/** first column */}
            <div className="flex flex-col gap-4 w-1/2">
              <div>
                <label htmlFor="productType">
                  <span className="font-bold">Product Status </span>
                  <span className="text-grey-500 text-sm">(optional)</span>
                </label>
                <Select
                  options={productStatusOptions}
                  placeholder="Select a product status"
                  value={state.productStatus}
                  onChange={(selectedOption) => {
                    setState({ ...state, productStatus: selectedOption });
                  }}
                />
              </div>
              <div>
                <label>
                  <span className="font-bold">SKU </span>
                  <span className="text-grey-500 text-sm">(optional)</span>
                </label>
                <input
                  type="text"
                  className="w-full h-9 p-2 border-1 border-gray-400 focus:border-2 focus:border-blue-500 focus:outline-none rounded-sm"
                  placeholder="Enter SKU"
                />
              </div>
              <div>
                <label htmlFor="shortDescription">
                  <span className="font-bold">Short Description </span>
                  <span className="text-red-500">*</span>
                </label>
                <ReactQuill
                  className="h-40"
                  theme="snow"
                  value={state.shortDescription}
                  onChange={(val) =>
                    setState({ ...state, shortDescription: val })
                  }
                />
              </div>
            </div>
            {/** second column */}
            <div className="flex flex-col gap-4 w-1/2">
              <div>
                <label htmlFor="taxBracket">
                  <span className="font-bold">Tax Bracket </span>
                  <span className="text-grey-500 text-sm">(optional)</span>
                </label>
                <Select
                  options={taxBracketOptions}
                  placeholder="Select your tax bracket"
                  value={state.taxBracket}
                  onChange={(selectedOption) => {
                    setState({ ...state, taxBracket: selectedOption });
                  }}
                />
              </div>
              <div>
                <label htmlFor="shortDescription">
                  <span className="font-bold">Long Description </span>
                  <span className="text-red-500">*</span>
                </label>
                <ReactQuill
                  className="h-40"
                  theme="snow"
                  value={state.longDescription}
                  onChange={(val) =>
                    setState({ ...state, longDescription: val })
                  }
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
