import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { useEffect, useRef } from "react";
import { Input } from "../../../components/ui/input";
import { ChartNoAxesColumn, Clock, ScrollText, X } from "lucide-react";
import { Textarea } from "../../../components/ui/textarea";
import { DatePicker } from "../../../components/ui/date-picker";
import { Button } from "../../../components/ui/button";
import deepcopy from "deepcopy";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";

export default function CardDetailsEdit({
  card,
  onClose,
  setColumns,
  columns,
}) {
  const findColumn = () => {
    for (const key in columns) {
      if (columns[key].some((c) => c.id === card.id)) {
        return key;
      }
    }
  };

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const formSchema = z
    .object({
      title: z.string().min(1, "Title is required"),
      description: z.string().optional(),
      startDate: z.date(),
      endDate: z.date(),
      status: z.enum(["todo", "inProgress", "done"]),
    })
    .refine((data) => data.endDate >= data.startDate, {
      message: "End date must be on or after start date",
      path: ["endDate"],
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: card.title,
      description: card.description,
      startDate: card.startDate,
      endDate: card.endDate,
      status: findColumn() as "todo" | "inProgress" | "done",
    },
  });

  const handleSubmit = (data) => {
    setColumns((prev) => {
      const temp = deepcopy(prev);
      let column = findColumn();

      if (column !== data.status) {
        temp[column] = temp[column].filter((c) => c.id !== card.id);
        temp[data.status] = [...temp[data.status], card];
        column = data.status;
      }

      temp[column] = temp[column].map((c) => {
        if (c.id === card.id) {
          return {
            ...c,
            title: data.title,
            description: data.description,
            startDate: data.startDate,
            endDate: data.endDate,
          };
        }
        return c;
      });
      return temp;
    });
    onClose();
  };

  // utility effect to set start and end date errors
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  useEffect(() => {
    if (!startDate) {
      form.setError("startDate", {
        type: "manual",
        message: "Start date is required",
      });
    } else if (!endDate) {
      form.setError("endDate", {
        type: "manual",
        message: "End date is required",
      });
    } else if (startDate && endDate && endDate < startDate) {
      form.setError("endDate", {
        type: "manual",
        message: "End date must be on or after start date",
      });
      form.setError("startDate", {
        type: "manual",
        message: "Start date must be before end date",
      });
    } else {
      form.clearErrors("startDate");
      form.clearErrors("endDate");
    }
  }, [startDate, endDate]);

  // confirm edit on enter key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        form.handleSubmit(handleSubmit)();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center">
      <div className="min-h-1/2 w-full m-4 p-6 max-h-screen md:m-0 md:w-1/2 bg-white rounded-2xl shadow-2xl flex flex-col gap-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4 w-full"
          >
            <div className="flex items-center justify-between gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input placeholder="Title" className="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div onClick={onClose} className="cursor-pointer">
                <X className="text-gray-500 rounded-full hover:bg-gray-200 h-8 w-8 p-1" />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h5 className="flex gap-2 font-semibold group items-center">
                  <ScrollText className="text-gray-500" />
                  <div>Description</div>
                </h5>
                <div className="ml-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Textarea
                            className="p-2 w-full max-h-40"
                            placeholder="Add a description..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Clock className="text-gray-500" />
              <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-4">
                <div className="flex flex-col gap-2">
                  <h6 className="font-semibold">Start Date</h6>
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <DatePicker
                            date={form.getValues("startDate")}
                            setDate={(date) => form.setValue("startDate", date)}
                            ref={startDateRef}
                            className={
                              form.formState.errors.startDate
                                ? "ring-destructive/20 dark:ring-destructive/40 border-destructive"
                                : ""
                            }
                          />
                        </FormControl>
                        <FormMessage />
                        {}
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <h6 className="font-semibold">Due Date</h6>
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <DatePicker
                            date={form.getValues("endDate")}
                            setDate={(date) => form.setValue("endDate", date)}
                            ref={endDateRef}
                            className={
                              form.formState.errors.endDate
                                ? "ring-destructive/20 dark:ring-destructive/40 border-destructive"
                                : ""
                            }
                          />
                        </FormControl>
                        <FormMessage />
                        {}
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h5 className="flex gap-2 font-semibold group items-center">
                <ChartNoAxesColumn className="text-gray-500" />
                <div>Status</div>
              </h5>
              <div className="ml-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          {...field}
                          className="sm:flex sm:flex-row flex-col sm:gap-8"
                        >
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value="todo" />
                            </FormControl>
                            <FormLabel className="font-normal">To Do</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value="inProgress" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              In Progress
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value="done" />
                            </FormControl>
                            <FormLabel className="font-normal">Done</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit">Confirm Edit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
