import { useState } from "react";
import UserInput from "./components/UserInput";
import Slots from "./components/Slots";
import Calendar from "./components/Calendar";

export default function App() {
  const [slots, setSlots] = useState(null);

  console.log(slots);

  return (
    <div>
      <Calendar slots={slots} />
      <UserInput setSlots={setSlots} slots={slots} />
      {slots && <Slots slots={slots} />}
    </div>
  );
}
