import { Download } from "lucide-react";
import Button from "./button";

export default function ImageComp() {
  return (
    <div className="grid md:grid-cols-2 grid-cols-1 gap-8">
      <img src="../public/flowers.jpg" className="h-72 w-full rounded-4xl" />
      <div className="px-4">
        <div className="text-3xl font-semibold font-roboto leading-relaxed">
          Get Quotes / <br />
          24/7 Customer Support
        </div>
        <div className="text-sm my-4">
          Our team serves as your digital front desk, handling guest inquiries,
          booking confirmations, and providing 24/7 support.
        </div>
        <div className="flex items-center space-x-2">
          <Button text="get quote" color="orange-400" />
          <button className="bg-black text-white p-1.5 rounded-md"><Download className="h-5 w-5"/></button>
          <div className="text-sm text-orange-400">Talk to Contact</div>
        </div>
      </div>
    </div>
  );
}
