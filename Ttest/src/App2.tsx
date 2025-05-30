import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function App2() {
  const formSchema = z.object({
    name: z.array(
      z.object({
        val: z.enum(["", "milk", "mayo", "cheese"]).refine((val) => val !== ""),
      })
    ),
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(formSchema) });
  const { fields, append } = useFieldArray({
    control,
    name: "name",
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input type="text" {...register(`name.${index}.val`)} />
          {errors.name?.[index]?.val && (
            <span>{errors.name[index].val.message}</span>
          )}
        </div>
      ))}
      <button type="button" onClick={() => append({ val: "" })}>
        + Add Product
      </button>
      <button type="submit">Submit</button>
    </form>
  );
}
