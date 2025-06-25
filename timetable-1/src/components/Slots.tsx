import { SquarePen } from "lucide-react";

export default function Slots({ slots }) {
  return (
    <div>
      {slots.map((slot, index) => (
        <Slot slot={slot} key={index} />
      ))}
    </div>
  );
}

function Slot({ slot }) {
  const handleEditSlot = () => {
    // todo
  };
  return (
    <div className="border rouned-md w-fit m-4 p-2">
      <div className="flex gap-2">
        {slot.title}: {slot.startTime} - {slot.endTime}
        <SquarePen onClick={handleEditSlot} />
      </div>
      <div></div>
    </div>
  );
}
