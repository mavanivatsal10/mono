import { useAuthState } from "react-firebase-hooks/auth";
import { auth, logout } from "./firebase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/");
  }, [user, loading]);

  return (
    <div>
      {user && <div>Signed in as {user.accessToken}</div>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
