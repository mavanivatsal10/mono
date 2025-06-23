import { useState } from "react";
import UserInput from "./components/UserInput";
import Slots from "./components/Slots";

export default function App() {
  const [slots, setSlots] = useState(null);

  return (
    <div>
      <UserInput setSlots={setSlots} slots={slots} />
      {slots && <Slots slots={slots} />}
    </div>
  );
}
