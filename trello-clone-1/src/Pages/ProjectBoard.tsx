import Kanban from "@/components/Kanban";
import type { projectDetailsType } from "@/types";

export default function ProjectBoard({ data }: { data: projectDetailsType }) {
  return (
    <div>
      <Kanban />
    </div>
  );
}
