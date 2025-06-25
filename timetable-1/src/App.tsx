import { useState } from "react";
import UserInput from "./components/UserInput";
import Slots from "./components/Slots";
import Calendar from "./components/Calendar";

export default function App() {
  const [slots, setSlots] = useState(null);

  console.log(slots);

  return (
    <div>
      <UserInput setSlots={setSlots} slots={slots} />
      {slots && (
        <div className="flex justify-center items-center m-16">
          <Calendar slots={slots} />
        </div>
      )}
    </div>
  );
}
