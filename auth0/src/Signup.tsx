import { useEffect, useState } from "react";
import {
  auth,
  registerWithEmailAndPassword,
  signInWithGithub,
  signInWithGoogle,
} from "./firebase";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user) navigate("/dashboard");
  }, [user, loading]);

  return (
    <div>
      <form>
        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="button"
          onClick={() => registerWithEmailAndPassword(name, email, password)}
        >
          Signup
        </button>
        <button type="button" onClick={signInWithGoogle}>
          sign up with google
        </button>
        <button type="button" onClick={signInWithGithub}>
          sign up with github
        </button>
        <div>
          already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}
