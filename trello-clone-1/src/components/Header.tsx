import { ProjectBoardContext } from "@/contexts/ProjectBoardContext";
import { useContext } from "react";

export default function Header() {
  const { showOverlay } = useContext(ProjectBoardContext);
  return (
    <div
      className={`flex items-center justify-center border-b-1 border-black p-2 w-screen ${
        showOverlay ? "blur-sm opacity-75" : ""
      }`}
    >
      <h1 className="text-2xl font-bold text-gray-800">Trello Clone</h1>
    </div>
  );
}
