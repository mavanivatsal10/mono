import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { TimeClock } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SingleTimePicker from "./SingleTimePicker";

export default function UserInput() {
  const timeSchema = z.union([
    z.null(),
    z
      .any()
      .refine((val) => val?.isValid?.() === true, { message: "Invalid time" }),
  ]);

  const combinedSchema = z.object({
    startTime: timeSchema,
    endTime: timeSchema,
    breakStartTime: timeSchema,
    breakEndTime: timeSchema,
  });

  const form = useForm({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      startTime: null,
      endTime: null,
      breakStartTime: null,
      breakEndTime: null,
    },
  });

  const calculateSlots = (data) => {
    const 
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        justifyContent: "center",
        alignItems: "center",
        margin: 4,
      }}
    >
      <Box sx={{ display: "flex", gap: 4 }}>
        <SingleTimePicker
          form={form}
          title={"Start Time"}
          fieldName="startTime"
        />
        <SingleTimePicker form={form} title={"End Time"} fieldName="endTime" />
      </Box>
      <Box sx={{ display: "flex", gap: 4 }}>
        <SingleTimePicker
          form={form}
          title={"Break Start Time"}
          fieldName="breakStartTime"
        />
        <SingleTimePicker
          form={form}
          title={"Break End Time"}
          fieldName="breakEndTime"
        />
      </Box>
      <Button
        variant="contained"
        onClick={form.handleSubmit(calculateSlots)}
        sx={{ width: "fit-content" }}
      >
        Calculate Slots
      </Button>
    </Box>
  );
}
