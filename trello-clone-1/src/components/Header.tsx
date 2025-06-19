import { ProjectBoardContext } from "@/contexts/ProjectBoardContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { showOverlay } = useContext(ProjectBoardContext);
  const navigate = useNavigate();

  return (
    <div
      className={`flex items-center justify-center border-b-1 border-black p-2 w-screen ${
        showOverlay ? "blur-sm opacity-75" : ""
      }`}
    >
      <h1
        className="text-2xl font-bold text-gray-800 cursor-pointer"
        onClick={() => navigate("/")}
      >
        Trello Clone
      </h1>
    </div>
  );
}
