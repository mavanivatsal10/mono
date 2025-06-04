import { useState } from "react";
import { sendPasswordReset } from "./firebase";
import { Link } from "react-router-dom";

export default function Reset() {
  const [email, setEmail] = useState("");
  return (
    <div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={() => sendPasswordReset(email)}>Reset Password</button>
      <Link to="/signup">Signup</Link>
    </div>
  );
}
