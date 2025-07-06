import Calendar from "@/components/Calendar";
import Add from "@/components/Add";

export default function App() {
  return (
    <div>
      <Calendar />
      <div className="flex items-center justify-center">
        <Add />
      </div>
    </div>
  );
}
