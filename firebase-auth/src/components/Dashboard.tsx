import type { JSX } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useNavigate } from "react-router-dom";
import type { User } from "firebase/auth";
import { logout } from "../lib/firebase";

export default function Dashboard(): JSX.Element {
  const { user, loading } = useAuthUser();
  const navigate = useNavigate();

  if (loading) return <div>Loading...</div>;
  if (!user) navigate("/login");

  return (
    <div>
      <div>signed in as {(user as User).email}</div>
      <div>
        <button onClick={() => logout()}>Logout</button>
      </div>
    </div>
  );
}
