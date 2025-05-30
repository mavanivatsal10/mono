import { useFieldArray, useForm } from "react-hook-form";

function Test2() {
  const { control, register, handleSubmit, setValue } = useForm();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "productDetails",
  });

  return (
    <>
      <form onSubmit={handleSubmit((data) => console.log(data))}>
        {fields.map((field, index) => (
          <div>
            <input {...register(`productDetails.${index}.name`)} />
            <button onClick={() => remove(index)}>Remove</button>
          </div>
        ))}
        <button onClick={() => append({ name: "" })}>Add Name</button>
        <input type="submit" />
      </form>
    </>
  );
}

export default Test2;
