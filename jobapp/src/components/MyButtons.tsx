import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect } from "react";

export default function MyButtons({ form, step, setStep }) {
  const currentStep = step;

  const validateField = async (fieldName) => {
    return await form.trigger(fieldName);
  };

  const validateStep = async () => {
    if (currentStep === 1) {
      const validFname = await validateField("fname");
      const validLname = await validateField("lname");
      const validEmail = await validateField("email");
      const validPhone = await validateField("phone");
      return validFname && validLname && validEmail && validPhone;
    } else if (currentStep === 2) {
      const validAddress1 = await validateField("address1");
      const validAddress2 = await validateField("address2");
      const validCountry = await validateField("country");
      const validState = await validateField("state");
      const validPreferredContact = await validateField("preferredContact");
      const validSub = await validateField("sub");
      return (
        validAddress1 &&
        validAddress2 &&
        validCountry &&
        validState &&
        validPreferredContact &&
        validSub
      );
    } else if (currentStep === 3) {
      const validSkills = await validateField("skills");
      const validResume = await validateField("resume");
      return validSkills && validResume;
    }
  };

  return (
    <div className="w-full">
      {step > 0 && step < 4 && (
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (currentStep > 1) setStep(currentStep - 1);
            }}
            disabled={step === 1}
          >
            <div className="flex gap-2 items-center justify-center">
              <ArrowLeft />
              <div>Previous</div>
            </div>
          </Button>
          <Button
            type="button"
            onClick={async () => {
              if (await validateStep()) {
                if (currentStep < 4) setStep(currentStep + 1);
              }
              if (step === 2 && !(await validateField("country"))) {
                document.querySelector("#country").style.border =
                  "1px solid red";
                document.querySelector("#country").style.borderRadius =
                  "0.125rem";
              }
              if (step === 2 && !(await validateField("state"))) {
                document.querySelector("#state").style.border = "1px solid red";
                document.querySelector("#state").style.borderRadius =
                  "0.125rem";
              }
            }}
          >
            <div className="flex gap-2 items-center justify-center">
              <div>Next</div>
              <ArrowRight />
            </div>
          </Button>
        </div>
      )}
      {step === 4 && (
        <div className="flex w-full justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(1)}
            disabled={currentStep === 1}
          >
            Edit
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      )}
    </div>
  );
}
