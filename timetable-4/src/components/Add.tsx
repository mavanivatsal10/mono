import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import AddSchedule from "./AddSchedule";
import AddLeave from "./AddLeave";
import AddSlot from "./AddSlot";
import { useTimetable } from "@/hooks/useTimetable";

export default function DialogDemo() {
  const { isOpenAdd, setIsOpenAdd } = useTimetable();

  return (
    <Dialog
      open={isOpenAdd.open}
      onOpenChange={(open) => setIsOpenAdd((prev) => ({ ...prev, open }))}
    >
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsOpenAdd((prev) => ({ ...prev, open: true }))}
        >
          Add
        </Button>
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
            <AddSchedule />
          </TabsContent>
          <TabsContent value="slot" className="w-full h-full">
            <AddSlot />
          </TabsContent>
          <TabsContent value="leave" className="w-full h-full">
            <AddLeave />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
