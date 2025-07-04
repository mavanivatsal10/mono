import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import AddSlots from "./AddSlots";
import AddLeave from "./AddLeave";
import { useState } from "react";

export default function DialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Tabs
          defaultValue="slots"
          className="flex items-center justify-center mt-4"
        >
          <TabsList>
            <TabsTrigger value="slots" className="px-6">
              Add Slots
            </TabsTrigger>
            <TabsTrigger value="leave" className="px-6">
              Add a Leave
            </TabsTrigger>
          </TabsList>
          <TabsContent value="slots" className="w-full h-full">
            <AddSlots setOpen={setOpen} />
          </TabsContent>
          <TabsContent value="leave" className="w-full h-full">
            <AddLeave setOpen={setOpen} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
