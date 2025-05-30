import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { error } from "zod/v4/locales/ar.js";

function Step1({ validatedSteps }) {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext();
  const shouldValidateOnChange = validatedSteps.includes(1);
  return (
    <>
      <input
        {...register("fname", {
          onChange: shouldValidateOnChange ? () => trigger("fname") : undefined,
        })}
      />
      {errors.fname && <span>{errors.fname.message}</span>}
    </>
  );
}

function Step2({ validatedSteps }) {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext();
  const shouldValidateOnChange = validatedSteps.includes(2);
  return (
    <>
      <input
        {...register("lname", {
          onChange: shouldValidateOnChange ? () => trigger("lname") : undefined,
        })}
      />
      {errors.lname && <span>{errors.lname.message}</span>}
    </>
  );
}

export default function Multistepform() {
  const [step, setStep] = useState(1);
  const [validatedSteps, setValidatedSteps] = useState([]);
  const form = useFormContext();

  const getCurrentStepFields = () => {
    if (step === 1) {
      return ["fname"];
    }
    if (step === 2) {
      return ["lname"];
    }
  };

  const handleNext = async () => {
    setValidatedSteps([...validatedSteps, step]);
    const isValid = await form.trigger(getCurrentStepFields());
    if (isValid) {
      setStep(step + 1);
    }
  };

  return (
    <>
      {step === 1 && <Step1 validatedSteps={validatedSteps} />}
      {step === 2 && <Step2 validatedSteps={validatedSteps} />}
      <button type="button" onClick={handleNext}>
        Next
      </button>
    </>
  );
}
