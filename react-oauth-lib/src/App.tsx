import { GoogleLogin, googleLogout } from "@react-oauth/google";
import axios from "axios";
import { useState } from "react";

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      <button
        onClick={() => {
          setUser(null);
          googleLogout();
        }}
      >
        logout
      </button>
      {user ? (
        <>singed in as {user.email}</>
      ) : (
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            axios
              .get(
                `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${credentialResponse.credential}`,
                {
                  headers: {
                    Authorization: `Bearer ${user.credentialResponse.credential}`,
                    Accept: "application/json",
                  },
                }
              )
              .then((res) => setUser(res.data));
          }}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      )}
    </div>
  );
}
