import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

export default function App() {
  const [email, setEmail] = useState("");

  return (
    <div>
      {email ? (
        <div>
          <p>{email}</p>
          <button
            onClick={() => {
              setEmail("");
              googleLogout();
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={(res) => {
            console.log(res);
            setEmail(jwtDecode(res.credential).email);
          }}
          onError={(err) => console.log(err)}
        />
      )}
    </div>
  );
}
