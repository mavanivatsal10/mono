export type slot = {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  date: string;
  type: "slot" | "no-events" | "buffer" | "break" | "leave";
};
