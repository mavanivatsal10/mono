import { GraduationCap, Home, User } from "lucide-react";
import { Button } from "./ui/button";

export default function ProgressBar({ step, setStep }) {
  return (
    <div className="flex flex-col px-8 relative">
      <div
        className="h-1 z-20 bg-primary absolute top-1/2"
        style={{ width: `${step === 1 ? 0 : step === 2 ? 40 : 75}%` }}
      ></div>

      <div className="h-1 bg-gray-200 absolute top-1/2 w-[80%]"></div>

      <div className="flex z-30 items-center justify-between">
        <Button variant="ghost" className="p-0 m-0">
          <div
            className={`rounded-full p-2 ${
              step > 0 ? "bg-primary text-primary-foreground" : "bg-gray-200"
            }`}
            onClick={() => setStep(1)}
          >
            <User className="!h-8 !w-8" />
          </div>
        </Button>
        <Button variant="ghost" className="p-0 m-0">
          <div
            className={`rounded-full p-2 ${
              step > 1 ? "bg-primary text-primary-foreground" : "bg-gray-200"
            }`}
            onClick={() => setStep(2)}
          >
            <Home className="!h-8 !w-8" />
          </div>
        </Button>
        <Button variant="ghost" className="p-0 m-0">
          <div
            className={`rounded-full p-2 ${
              step > 2 ? "bg-primary text-primary-foreground" : "bg-gray-200"
            }`}
            onClick={() => setStep(3)}
          >
            <GraduationCap className="!h-8 !w-8" />
          </div>
        </Button>
      </div>
    </div>
  );
}
