import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import type { slot } from "@/types/types";
import { useTimetable } from "@/hooks/useTimetable";
import AddSlots from "./AddSlots";
import AddLeave from "./AddLeave";

export default function DialogDemo() {
  const { slots } = useTimetable();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add</Button>
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
            <AddSlots />
          </TabsContent>
          <TabsContent value="leave" className="w-full h-full">
            <AddLeave />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
