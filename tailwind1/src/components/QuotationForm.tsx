import { Upload } from "lucide-react";
import Button from "./button";
import Input from "./Input";

export default function QuatationForm() {
  return (
    <div className="grid grid-cols-1 w-full gap-6 md:grid-cols-4">
      <div className="flex flex-col md:col-span-3 space-y-6 bg-gray-100 rounded-3xl py-4 px-8">
        <div className="text-lg font-semibold">
          <span>Get Your Custom Quote - </span>
          <span className="text-orange-400">Sanitary</span>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Input type="text" placeholder="Name" />
          <Input type="email" placeholder="Email" />
          <Input type="text" placeholder="Phone Number" />
          <Input type="text" placeholder="Address" />
          <textarea
            placeholder="Description"
            className="col-span-2 border border-gray-400 px-2 py-1 rounded-lg focus:outline-none h-20"
          />
          <input type="file" className="hidden" />
          <div
            className="col-span-2 flex gap-2 border-dashed flex items-center justify-center border border-gray-500 rounded-lg focus:outline-none h-20 bg-white"
            onClick={() => {}}
          >
            <Upload />
            <span>Upload Image</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          * your file should not exceed 2mb
        </p>
        <div>
          <button
            type="submit"
            className="flex bg-orange-400 font-semibold text-sm text-white py-2 px-6 rounded-md"
          >
            GET QUOTE
          </button>
        </div>
      </div>
      <div className="bg-amber-500 md:col-span-1 rounded-3xl md:h-full h-40"></div>
    </div>
  );
}
