import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import AddSchedule from "./AddSchedule";
import AddLeave from "./AddLeave";
import { useState } from "react";
import AddSlot from "./AddSlot";

export default function DialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>Add</Button>
      </DialogTrigger>
      <DialogContent
        className="overflow-auto"
        style={{ maxHeight: `${window.innerHeight - 100}px` }}
      >
        <Tabs
          defaultValue="schedule"
          className="flex items-center justify-center mt-4"
        >
          <TabsList>
            <TabsTrigger value="schedule" className="px-6">
              Add Schedule
            </TabsTrigger>
            <TabsTrigger value="slot" className="px-6">
              Add a Single Slot
            </TabsTrigger>
            <TabsTrigger value="leave" className="px-6">
              Add a Leave
            </TabsTrigger>
          </TabsList>
          <TabsContent value="schedule" className="w-full h-full">
            <AddSchedule setOpen={setOpen} />
          </TabsContent>
          <TabsContent value="slot" className="w-full h-full">
            <AddSlot setOpen={setOpen} />
          </TabsContent>
          <TabsContent value="leave" className="w-full h-full">
            <AddLeave setOpen={setOpen} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
