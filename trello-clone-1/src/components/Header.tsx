import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { GlobalContext } from "@/contexts/GlobalContext";

export default function Header() {
  const { showOverlay, userData } = useContext(GlobalContext);
  const navigate = useNavigate();

  return (
    <div
      className={`flex items-center ${
        userData ? "justify-between" : "justify-center"
      } border-b-1 border-black p-2 w-screen ${
        showOverlay ? "blur-sm opacity-75" : ""
      }`}
    >
      <h1
        className="text-2xl font-bold text-gray-800 cursor-pointer"
        onClick={() => navigate("/")}
      >
        Trello Clone
      </h1>
      {userData ? <LogoutButton /> : null}
    </div>
  );
}

function LogoutButton() {
  const { setUserData } = useContext(GlobalContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUserData(null);
    window.localStorage.removeItem("userData");
    navigate("/login");
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  );
}
