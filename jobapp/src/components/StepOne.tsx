import { useEffect, useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

function StepOne({ form }) {
  form.watch("fname");
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="fname"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div>
                <span>First Name</span> <span className="text-red-500">*</span>
              </div>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="John"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  form.formState.errors.fname = "";
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="lname"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div>
                <span>Last Name</span> <span className="text-red-500">*</span>
              </div>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Doe"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  form.formState.errors.lname = "";
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div>
                <span>Email</span> <span className="text-red-500">*</span>
              </div>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="johndoe@example.com"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  form.formState.errors.email = "";
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div>
                <span>Phone</span> <span className="text-red-500">*</span>
              </div>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="9876543210"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  form.formState.errors.phone = "";
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default StepOne;
