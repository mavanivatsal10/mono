import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Multistepform from "./Multistepform";

const step1Schema = z.object({
  fname: z.string().min(2, "First name must be at least 2 characters long"),
});

const step2Schema = z.object({
  lname: z.string().min(2, "Last name must be at least 2 characters long"),
});

const combinedSchema = step1Schema.merge(step2Schema);

function App() {
  const methods = useForm({
    resolver: zodResolver(combinedSchema),
    mode: "onSubmit",
  });

  return (
    <FormProvider {...methods}>
      <Multistepform />
    </FormProvider>
  );
}

export default App;
