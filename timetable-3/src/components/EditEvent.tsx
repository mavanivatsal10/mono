import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useTimetable } from "@/hooks/useTimetable";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { timeSchema } from "@/schemas/schemas";
import DatePicker from "./ui/date-picker";

export default function EditEvent() {
  const { editEvent, setEditEvent } = useTimetable();

  return (
    <Dialog
      open={editEvent.showOverlay}
      onOpenChange={(open) =>
        setEditEvent({
          showOverlay: open,
          eventData: open ? editEvent.eventData : null,
        })
      }
    >
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px] overflow-auto"
        style={{ maxHeight: `${window.innerHeight - 100}px` }}
      >
        <EditForm />
      </DialogContent>
    </Dialog>
  );
}

function EditForm() {
  const {
    slots,
    editEvent: { eventData: event },
  } = useTimetable();

  const slot = slots.find((s) => s.id === event?._def.extendedProps.slotId);

  const formSchema = z
    .object({
      title: z.string(),
      description: z.string(),
      start: timeSchema,
      end: timeSchema,
      date: z.date().nullable(),
    })
    .superRefine((data, ctx) => {
      if (data.start > data.end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start time must be before end time",
          path: ["end"],
        });
      }

      if (data.date === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date is required",
          path: ["date"],
        });
      }

      if (data.title.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Title is required",
          path: ["title"],
        });
      }
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: slot?.title || "",
      description: slot?.description || "",
      start: slot?.start || "",
      end: slot?.end || "",
      date: event?._instance?.range.start || new Date(),
    },
  });

  const editSlot = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(editSlot)}
        className="p-4 flex items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center gap-6 w-full">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex w-full gap-4">
            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      className="flex items-center justify-center"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      className="flex items-center justify-center"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Confirm Edit</Button>
        </div>
      </form>
    </Form>
  );
}
