// import { useState } from "react";
// import { useForm } from "react-hook-form";

// export default function TestParent() {
//   const { handleSubmit, register, setValue } = useForm();

//   const [myState, setMyState] = useState<File[]>([]);

//   return (
//     <form
//       className="flex flex-col items-center justify-center"
//       onSubmit={handleSubmit((data) => console.log(data))}
//     >
//       <input
//         type="file"
//         multiple
//         {...register("files")}
//         onChange={(e) => {
//           const file = e.target.files?.[0];
//           if (file) {
//             setMyState((prev) => [...prev, file]);
//             setValue("files", [...myState, file]);
//           }
//         }}
//       />
//       <button type="submit">Submit</button>
//     </form>
//   );
// }

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

export default function NameListForm() {
  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      names: [{ name: '' }] // initialize with one empty name
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'names'
  });

  const onSubmit = (data) => {
    console.log(data.names); // this will be an array of name objects
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input
            {...register(`names.${index}.name`)}
            placeholder={`Name ${index + 1}`}
          />
          <button type="button" onClick={() => remove(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: '' })}>Add Name</button>
      <input type="submit" />
    </form>
  );
}
