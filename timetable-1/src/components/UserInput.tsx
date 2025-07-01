import AddLeave from "./AddLeave";
import AddSlots from "./AddSlots";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function UserInput({ slots, setSlots }) {
  return (
    <Tabs
      defaultValue="slots"
      className="flex items-center justify-center w-120 h-110 mt-4"
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
        <AddSlots slots={slots} setSlots={setSlots} />
      </TabsContent>
      <TabsContent value="leave" className="w-full h-full">
        <AddLeave slots={slots} setSlots={setSlots} />
      </TabsContent>
    </Tabs>
  );
}
