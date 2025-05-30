import { Controller, useForm, useFieldArray } from "react-hook-form";
import ReactQuill from "react-quill";
import Select from "react-select";
import "react-quill/dist/quill.snow.css";
import { useRef, useState } from "react";

function ProductImages({
  productIndex,
  control,
  register,
  allProductImages,
  setAllProductImages,
}) {
  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: `productDetails.${productIndex}.images`,
  });

  const inputRefs = useRef<(HTMLElement | null)[]>([]);
  const [numImages, setNumImages] = useState(0);

  return (
    <div>
      {imageFields.map((field, index) => (
        <div key={field.id} className="flex gap-4">
          <input
            {...register(`productDetails.${productIndex}.images.${index}`)}
            ref={(elem) => {
              register(`productDetails.${productIndex}.images.${index}`).ref(
                elem
              );
              inputRefs.current[index] = elem;
            }}
            type="file"
            className="hidden"
            onChange={(e) => {
              register(
                `productDetails.${productIndex}.images.${index}`
              ).onChange(e);
              setAllProductImages((prev) => {
                const newAllProductImages = [...prev];
                newAllProductImages[productIndex] = [
                  ...newAllProductImages[productIndex],
                  URL.createObjectURL(e.target.files?.[0]),
                ];
                console.log(allProductImages);
                return newAllProductImages;
              });
            }}
          />
        </div>
      ))}
      <div className="flex gap-4">
        {allProductImages[productIndex].map((productImage) => {
          return (
            <img
              key={productImage}
              src={productImage}
              className="w-20 h-20 object-cover rounded-md border-2 border-gray-400"
            />
          );
        })}
        <button
          onClick={() => {
            appendImage({});
            setTimeout(() => inputRefs.current?.[numImages]?.click(), 100);
            setNumImages((prev) => prev + 1);
          }}
          className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center flex-col border-2 border-dashed border-gray-400 hover:bg-gray-300 transition duration-200"
        >
          <div className="text-3xl text-gray-500">+</div>
          <div className="text-gray-500">Add</div>
        </button>
      </div>
    </div>
  );
}

function ProductDetails({ productIndex, control, register }) {
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
    { value: 12, label: "12%" },
    { value: 18, label: "18%" },
    { value: 28, label: "28%" },
  ];

  const tagOptions = [
    { value: "vegetarian", label: "Vegetarian" },
    { value: "non-vegetarian", label: "Non-Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "gluten-free", label: "Gluten-Free" },
  ];
  return (
    <div className="flex flex-col gap-4">
      {/** product title */}
      <div className="mt-4">
        <label htmlFor="productTitle">
          <span className="font-bold">Product Title </span>
          <span className="text-red-500">*</span>
        </label>
        <Controller
          control={control}
          name={`productDetails.${productIndex}.productTitle`}
          render={({ field, fieldState: { error } }) => (
            <>
              <Select
                {...field}
                options={productTitleOptions}
                placeholder="Select a product to buy"
              />
              {error && (
                <div className="text-red-500 text-sm">{error.message}</div>
              )}
            </>
          )}
          rules={{ required: "Product title is required" }}
        />
      </div>
      {/** product type */}
      <div>
        <label htmlFor="productType">
          <span className="font-bold">Product Type </span>
          <span className="text-red-500">*</span>
        </label>
        <Controller
          control={control}
          name={`productDetails.${productIndex}.productType`}
          render={({ field, fieldState: { error } }) => (
            <>
              <Select
                {...field}
                options={productTypeOptions}
                placeholder="Select a product type"
              />
              {error && (
                <div className="text-red-500 text-sm">{error.message}</div>
              )}
            </>
          )}
          rules={{ required: "Product type is required" }}
        />
      </div>
      {/** 2 columns */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {/** first column */}
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="productType">
              <span className="font-bold">Product Status </span>
              <span className="text-grey-500 text-sm">(optional)</span>
            </label>
            <Controller
              control={control}
              name={`productDetails.${productIndex}.productStatus`}
              render={({ field }) => (
                <Select
                  {...field}
                  options={productStatusOptions}
                  placeholder="Select a product status"
                />
              )}
            />
          </div>
          <div>
            <label>
              <span className="font-bold">SKU </span>
              <span className="text-grey-500 text-sm">(optional)</span>
            </label>
            <input
              {...register(`productDetails.${productIndex}.sku`)}
              type="text"
              className="w-full h-9 p-2 border-1 border-gray-400 focus:border-2 focus:border-blue-500 focus:outline-none rounded-sm bg-white"
              placeholder="Enter SKU"
            />
          </div>
          <div>
            <label htmlFor="shortDescription">
              <span className="font-bold">Short Description </span>
              <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name={`productDetails.${productIndex}.shortDescription`}
              render={({ field, fieldState: { error } }) => (
                <>
                  <ReactQuill
                    {...field}
                    className="custom-quill"
                    theme="snow"
                  />
                  {error && (
                    <div className="text-red-500 text-sm">{error.message}</div>
                  )}
                </>
              )}
              rules={{ required: "Short description is required" }}
            />
          </div>
        </div>
        {/** second column */}
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="taxBracket">
              <span className="font-bold">Tax Bracket </span>
              <span className="text-grey-500 text-sm">(optional)</span>
            </label>
            <Controller
              control={control}
              name={`productDetails.${productIndex}.taxBracket`}
              render={({ field, fieldState: { error } }) => (
                <Select
                  {...field}
                  options={taxBracketOptions}
                  placeholder="Select your tax bracket"
                />
              )}
            />
          </div>
          <div>
            <label htmlFor="shortDescription">
              <span className="font-bold">Long Description </span>
              <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name={`productDetails.${productIndex}.longDescription`}
              render={({ field, fieldState: { error } }) => (
                <>
                  <ReactQuill
                    {...field}
                    className="custom-quill"
                    theme="snow"
                  />
                  {error && (
                    <div className="text-red-500 text-sm">{error.message}</div>
                  )}
                </>
              )}
              rules={{ required: "Long description is required" }}
            />
          </div>
          <div>
            <label>
              <span className="font-bold">Tags </span>
              <span className="text-grey-500 text-sm">(optional)</span>
            </label>
            <Controller
              control={control}
              name={`productDetails.${productIndex}.tags`}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  options={tagOptions}
                  placeholder="Select tag(s)"
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { register, control, handleSubmit } = useForm({
    mode: "onChange",
  });
  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: "productDetails",
  });

  const [allProductImages, setAllProductImages] = useState([[]]);

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      {productFields.map((productField, productIndex) => (
        <div key={productField.id} className="m-4">
          <h1 className="text-2xl font-bold">
            Product {productIndex + 1} Images
          </h1>
          <ProductImages
            productIndex={productIndex}
            control={control}
            register={register}
            allProductImages={allProductImages}
            setAllProductImages={setAllProductImages}
          />
          <h1 className="text-2xl font-bold">
            Product {productIndex + 1} Details
          </h1>
          <ProductDetails
            productIndex={productIndex}
            control={control}
            register={register}
          />
        </div>
      ))}
      <button
        className="text-xl font-bold text-white bg-blue-500 p-4"
        onClick={() => {
          appendProduct({});
          setAllProductImages([...allProductImages, []]);
        }}
      >
        Add Product
      </button>
      <button
        className="text-xl font-bold text-white bg-black p-4"
        type="submit"
      >
        Submit
      </button>
    </form>
  );
}

export default App;
