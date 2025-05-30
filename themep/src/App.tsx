import { useContext, useEffect } from "react";
import { ThemeContext } from "./ThemeProvider";
import { ModeToggle } from "./components/mode-toggle";

function App() {
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          const theme = document.documentElement.getAttribute("data-theme");
          console.log(theme)
          if (theme === "dark") {
            document.documentElement.setAttribute("data-theme", "light");
          } else {
            document.documentElement.setAttribute("data-theme", "dark");
          }
        }}
      >
        toggle
      </button>
    </div>
  );
}

export default App;
