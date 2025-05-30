import { useFieldArray, useForm } from "react-hook-form";

function Images({ nestIndex, control, register }) {
  const { fields, append } = useFieldArray({
    control,
    name: `productDetails.${nestIndex}.images`,
  });

  return (
    <>
      {fields.map((field, k) => (
        <div key={field.id}>
          <input
            type="file"
            {...register(`productDetails.${nestIndex}.images.${k}.url`)}
          />
        </div>
      ))}
      <button type="button" onClick={() => append({ url: "" })}>
        + Add Image
      </button>
    </>
  );
}

function MyComp2() {
  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      productDetails: [{ images: [{}] }],
    },
  });

  const { fields, append } = useFieldArray({
    control,
    name: "productDetails",
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      {fields.map((field, index) => (
        <div
          key={field.id}
          style={{ border: "1px solid #ccc", margin: "10px" }}
        >
          <h4>Product {index + 1}</h4>
          <Images nestIndex={index} control={control} register={register} />
        </div>
      ))}

      <button type="button" onClick={() => append({ images: [{ url: "" }] })}>
        + Add Product
      </button>

      <button type="submit">Submit</button>
    </form>
  );
}

export default MyComp2;
