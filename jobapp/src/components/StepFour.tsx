import { Label } from "./ui/label";

export default function StepFour({ form }) {
  return (
    <div>
      <div className="text-2xl">Review Your Details</div>
      <div className="flex flex-col gap-4 mt-6">
        <div>
          <Label className="mb-2 text-lg">Name:</Label>
          <div>
            {form.getValues("fname")} {form.getValues("lname")}
          </div>
        </div>
        <div>
          <Label className="mb-2 text-lg">Email:</Label>
          {form.getValues("preferredContact") === "email" && (
            <div>(preferred contact method)</div>
          )}
          <div>{form.getValues("email")}</div>
        </div>
        <div className="flex gap-2">
          <Label className="mb-2 text-lg">Phone:</Label>
          {form.getValues("preferredContact") === "phone" && (
            <div>(preferred contact method)</div>
          )}
          <div>{form.getValues("phone")}</div>
        </div>
        <div>
          <Label className="mb-2 text-lg">Address:</Label>
          <div>
            {form.getValues("address1")}, {form.getValues("address2")},{" "}
            {form.getValues("state")}, {form.getValues("country")}
          </div>
        </div>
        <div>
          <Label className="mb-2 text-lg">Resume:</Label>
          <div>{form.getValues("resume") ? "Uploaded" : "Not uploaded"}</div>
        </div>
        <div>
          <Label className="mb-2 text-lg">Skills:</Label>
          <div>
            {form.getValues("skills").map((item, index) => {
              if (index === form.getValues("skills").length - 1) {
                return item.skill;
              } else {
                return item.skill + ", ";
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
