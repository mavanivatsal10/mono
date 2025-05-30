import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <div>
        <button type="button" onClick={() => setTheme("light")}>light</button>
        <button type="button" onClick={() => setTheme("dark")}>dark</button>
    </div>
  );
}
