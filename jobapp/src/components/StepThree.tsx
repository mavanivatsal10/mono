import { useFieldArray } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Label } from "./ui/label";

import { Document, Page, pdfjs } from "react-pdf";
import { Dialog, DialogContent } from "./ui/dialog";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function StepThree({ form }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const inputRef = useRef(null);
  const headerRef = useRef(null);
  const [currentNumSkills, setMaxNum] = useState(0);
  const [preview, setPreview] = useState(false);
  const [showSkillError, setShowSkillError] = useState(false);
  const [maxAllowedSkills, setMaxAllowedSkills] = useState(5);

  useEffect(() => {
    const temp = form.formState.errors?.skills?.some(
      (item) => item.skill !== ""
    );
    setShowSkillError(!!temp);
  }, [form.watch()]);

  return (
    <div className="space-y-4">
      <Label style={showSkillError ? { color: "red" } : {}} ref={headerRef}>
        Skills
      </Label>
      <div className="flex flex-col gap-2">
        {fields.map((field, index) => (
          <FormField
            key={field.id}
            control={form.control}
            name={`skills.${index}.skill`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex">
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (form.formState.errors)
                          form.formState.errors.skills[index].skill = "";
                      }}
                      style={
                        form.formState.errors?.skills?.[index]?.skill
                          ? { border: "1px solid red" }
                          : {}
                      }
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        remove(index);
                        setMaxNum((prev) => prev - 1);
                      }}
                    >
                      <X className="text-muted-foreground" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        {currentNumSkills < maxAllowedSkills && (
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              append({ skill: "" });
              setMaxNum((prev) => prev + 1);
            }}
          >
            <div className="flex gap-2 items-center justify-center">
              <Plus />
              <div>Add a skill</div>
            </div>
          </Button>
        )}
      </div>

      <FormField
        control={form.control}
        name="resume"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div>
                <span>Resume</span> <span className="text-red-500">*</span>
              </div>
            </FormLabel>
            <FormControl>
              <div>
                <div className="flex gap-4">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    ref={(e) => {
                      field.ref(e);
                      inputRef.current = e;
                    }}
                    onChange={(e) => {
                      field.onChange(e);
                      const file = e.target.files?.[0];
                      if (file) {
                        form.setValue("resume", file);
                        form.trigger("resume");
                      }
                    }}
                  />
                  {form.getValues("resume") === null ? (
                    <Button
                      variant="ghost"
                      type="button"
                      className="w-full"
                      onClick={() => inputRef.current?.click()}
                    >
                      <div className="flex w-full gap-2 items-center justify-center">
                        <Plus />
                        <div>Add</div>
                      </div>
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 items-center">
                        <Button
                          variant="ghost"
                          onClick={() => setPreview(true)}
                        >
                          <div>{form.getValues("resume").name}</div>
                        </Button>
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={() => {
                            form.setValue("resume", null);
                          }}
                        >
                          <X className="text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {preview && (
                  <Dialog open={preview} onOpenChange={setPreview}>
                    <DialogContent className="h-auto w-auto max-h-screen overflow-auto">
                      <Document file={form.getValues("resume")}>
                        <Page
                          pageNumber={1}
                          width={400}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          className="!m-0 !p-0"
                        />
                      </Document>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
