import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { combinedCheckoutSchema } from "@/lib/schema";
import StepOne from "./StepOne";
import MyButtons from "./MyButtons";
import { useEffect, useState } from "react";
import ProgressBar from "./ProgressBar";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import { Form } from "./ui/form";
import StepFour from "./StepFour";

function MyForm() {
  const form = useForm<z.infer<typeof combinedCheckoutSchema>>({
    resolver: zodResolver(combinedCheckoutSchema),
    defaultValues: {
      fname: "",
      lname: "",
      email: "",
      phone: "",
      address1: "",
      address2: "",
      country: "",
      state: "",
      preferredContact: "",
      skills: [],
      resume: null,
    },
  });

  function onSubmit(values: z.infer<typeof combinedCheckoutSchema>) {
    console.log(values);
  }

  const [step, setStep] = useState(1);

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary relative">
      <div className="w-md flex flex-col gap-4">
        {step < 4 && <ProgressBar step={step} setStep={setStep} />}
        <div className="w-full border p-8 rounded-lg shadow bg-white">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4 w-full">
                {step === 1 && <StepOne form={form} />}
                {step === 2 && <StepTwo form={form} />}
                {step === 3 && <StepThree form={form} />}
                {step === 4 && <StepFour form={form} />}
                <MyButtons form={form} step={step} setStep={setStep} />
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default MyForm;
