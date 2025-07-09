import Calendar from "@/components/Calendar";
import Add from "@/components/Add";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <div>
      <Calendar />
      <div className="flex items-center justify-center">
        <Add />
      </div>
      <Toaster />
    </div>
  );
}
