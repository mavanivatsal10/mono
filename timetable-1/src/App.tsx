import { useState } from "react";
import UserInput from "./components/UserInput";
import Calendar from "./components/Calendar";

export default function App() {
  const [slots, setSlots] = useState(null);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-gray-100 gap-8">
      <div className="bg-white p-4 rounded-lg shadow-md h-fit w-fit">
        <UserInput setSlots={setSlots} slots={slots} />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md h-fit w-fit">
        <Calendar slots={slots} />
      </div>
    </div>
  );
}
