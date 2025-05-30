import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Controller, set, useForm } from "react-hook-form";

const MyComponent = forwardRef((props, ref) => {
  const { register, handleSubmit, control, setValue, getValues } = useForm();

  const inputRef = useRef<HTMLInputElement>(null);
  const [last, setLast] = useState(0);

  const [productImages, setProductImages] = useState(null);

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

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form className="p-4" onSubmit={handleSubmit(onSubmit)}>
      {Array.from({ length: last + 1 }).map((_, i) => {
        return (
          <div>
            {/** Product Image */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold mt-4">Product Photo</h1>
                <div className="flex gap-4">
                  <Controller
                    name={`productImages.${i}`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        ref={(e) => {
                          field.ref(e);
                          inputRef.current = e;
                        }}
                        onChange={(e) => {
                          const files = e.target.files;
                          field.onChange(files);
                        }}
                      />
                    )}
                  />
                  {productImages !== null &&
                    productImages[i].map((productImage) => {
                      return (
                        <img
                          key={productImage}
                          src={productImage}
                          alt="Product"
                          className="w-20 h-20 object-cover rounded-md border-2 border-gray-400"
                        />
                      );
                    })}

                  <button
                    type="button"
                    className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center flex-col border-2 border-dashed border-gray-400 hover:bg-gray-300 transition duration-200"
                    onClick={() => {
                      inputRef.current?.click();
                    }}
                  >
                    <div className="text-3xl text-gray-500">+</div>
                    <div className="text-gray-500">Add</div>
                  </button>
                </div>
              </div>
              {i === last && (
                <button
                  className="text-2xl"
                  onClick={() => {
                    setLast((prev) => prev + 1);
                  }}
                >
                  Add product
                </button>
              )}
            </div>
            {/** Basic Details */}
            <h1 className="text-2xl font-bold mt-4">Basic Details</h1>
            <div className="flex flex-col gap-4">
              {/** product title */}
              <div className="mt-4">
                <label htmlFor="productTitle">
                  <span className="font-bold">Product Title </span>
                  <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name={`productTitle.${i}`}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Select
                        {...field}
                        options={productTitleOptions}
                        placeholder="Select a product to buy"
                      />
                      {error && (
                        <div className="text-red-500 text-sm">
                          {error.message}
                        </div>
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
                  name={`productType.${i}`}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Select
                        {...field}
                        options={productTypeOptions}
                        placeholder="Select a product type"
                      />
                      {error && (
                        <div className="text-red-500 text-sm">
                          {error.message}
                        </div>
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
                      name={`productStatus.${i}`}
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
                      {...register(`sku.${i}`)}
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
                    <Controller
                      control={control}
                      name={`shortDescription.${i}`}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <ReactQuill
                            {...field}
                            className="custom-quill"
                            theme="snow"
                          />
                          {error && (
                            <div className="text-red-500 text-sm">
                              {error.message}
                            </div>
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
                      name={`taxBracket.${i}`}
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
                      name={`longDescription.${i}`}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <ReactQuill
                            {...field}
                            className="custom-quill"
                            theme="snow"
                          />
                          {error && (
                            <div className="text-red-500 text-sm">
                              {error.message}
                            </div>
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
                      name={`tags.${i}`}
                      render={({ field }) => (
                        <Select
                          {...field}
                          isMulti
                          options={tagOptions}
                          placeholder="Select tag(s)"
                        />
                      )}
                      rules={{ required: "Product title is required" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {/** Submit button */}
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded-md mt-8"
      >
        Submit
      </button>
    </form>
  );
});

export default MyComponent;
