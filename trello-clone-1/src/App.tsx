import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import ProjectBoard from "./pages/ProjectBoard/ProjectBoard";
import Login from "./Pages/Auth/Login";
import Signup from "./Pages/Auth/Signup";
import { useContext } from "react";
import { GlobalContext } from "./contexts/GlobalContext";

export default function App() {
  const { userData } = useContext(GlobalContext);

  return (
    <div>
      <Header />
      <Routes>
        <Route
          path="/"
          element={userData ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/projectboard/:projectId"
          element={userData ? <ProjectBoard /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={userData ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={userData ? <Navigate to="/" /> : <Signup />}
        />
      </Routes>
    </div>
  );
}
