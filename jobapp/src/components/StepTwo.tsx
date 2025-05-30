import Select from "react-select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { obj } from "@/lib/countries";

const countries = Object.entries(obj).map(([key, value]) => ({
  value: key,
  label: value.name,
}));

const countryStates = (countryLabel: string) => {
  const country = Object.entries(obj).find(
    ([key, value]) => value.name === countryLabel
  )?.[0];
  const states = obj[country]?.states.map((state: string) => ({
    value: state,
    label: state
      .split(" ")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" "),
  }));
  return states;
};

export default function StepTwo({ form }) {
  const country = form.watch("country");

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="address1"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div>
                <span>Address Line 1</span>{" "}
                <span className="text-red-500">*</span>
              </div>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="123 Main Street"
                {...field}
                className="max-h-24"
                onChange={(e) => {
                  field.onChange(e);
                  form.formState.errors.address1 = "";
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="address2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div>
                <span>Address Line 2</span>{" "}
                <span className="text-red-500">*</span>
              </div>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Suite 123"
                {...field}
                className="max-h-24"
                onChange={(e) => {
                  field.onChange(e);
                  form.formState.errors.address2 = "";
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div>
                <span>Country</span> <span className="text-red-500">*</span>
              </div>
            </FormLabel>
            <FormControl>
              <Select
                id="country"
                {...field}
                value={countries.find(
                  (country) => country.label === form.getValues("country")
                )}
                options={countries}
                onChange={async (value) => {
                  field.onChange(value);
                  form.setValue("country", value?.label);
                  if (await form.trigger("country")) {
                    document.querySelector("#country").style.border = "none";
                  }
                  form.formState.errors.country = "";
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="state"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div>
                <span>State</span> <span className="text-red-500">*</span>
              </div>
            </FormLabel>
            <FormControl>
              <Select
                id="state"
                isDisabled={!country}
                {...field}
                value={countryStates(form.getValues("country"))?.find(
                  (state) => state.label === form.getValues("state")
                )}
                options={countryStates(form.getValues("country"))}
                onChange={async (value) => {
                  field.onChange(value);
                  form.setValue("state", value?.label);
                  if (await form.trigger("state")) {
                    document.querySelector("#state").style.border = "none";
                  }
                  form.formState.errors.state = "";
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="preferredContact"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div>
                <span>Preferred Contact Method</span>{" "}
                <span className="text-red-500">*</span>
              </div>
            </FormLabel>
            <FormControl>
              <RadioGroup
                value={form.getValues("preferredContact")}
                onValueChange={async (value) => {
                  form.setValue("preferredContact", value);
                  await form.trigger("preferredContact");
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email" className="font-normal">
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone" className="font-normal">
                      Phone
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="sub"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={form.getValues("sub")}
                  onCheckedChange={(value) => {
                    form.setValue("sub", value);
                  }}
                />
                <label htmlFor="terms" className="text-sm">
                  Subscribe to our newsletter
                </label>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
