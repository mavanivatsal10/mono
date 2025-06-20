import { createContext, useState } from "react";

export const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const user = JSON.parse(window.localStorage.getItem("userData")) || null;
  const [userData, setUserData] = useState(user);

  return (
    <GlobalContext.Provider value={{ userData, userData, setUserData }}>
      {children}
    </GlobalContext.Provider>
  );
}
