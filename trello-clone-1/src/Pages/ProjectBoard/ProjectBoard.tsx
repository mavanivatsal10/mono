import CardDetails from "@/pages/ProjectBoard/components/CardDetails";
import Kanban from "@/pages/ProjectBoard/components/Kanban";
import { ProjectBoardContext } from "@/contexts/ProjectBoardContext";
import type { projectDetailsType } from "@/types";
import { useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function ProjectBoard({ data }: { data: projectDetailsType }) {
  const { showOverlay, setShowOverlay, selectedCard, setSelectedCard } =
    useContext(ProjectBoardContext);

  const [columns, setColumns] = useState({
    todo: [
      {
        id: uuidv4(),
        title:
          "task 1 mmmmmmmmmmmmmmm mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmm mmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmmmmm mmmmmmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmmmm mmmmmmmmmmmmmmm mmmmmmmmmmmmm",
        description:
          "task 1 description mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmm mmmmmmmmmm",
        startDate: new Date(),
        endDate: new Date(),
      },
      {
        id: uuidv4(),
        title: "task 2",
        description: "task 2 description",
        startDate: new Date(),
        endDate: new Date(),
      },
    ],
    inProgress: [
      {
        id: uuidv4(),
        title: "task 3",
        description: "task 3 description",
        startDate: new Date(),
        endDate: new Date(),
      },
      {
        id: uuidv4(),
        title: "task 4",
        description: "task 4 description",
        startDate: new Date(),
        endDate: new Date(),
      },
    ],
    done: [
      {
        id: uuidv4(),
        title: "task 5",
        description: "task 5 description",
        startDate: new Date(),
        endDate: new Date(),
      },
      {
        id: uuidv4(),
        title: "task 6",
        description: "task 6 description",
        startDate: new Date(),
        endDate: new Date(),
      },
    ],
  });

  return (
    <div>
      <div className={`${showOverlay ? "blur-sm opacity-75" : ""}`}>
        <Kanban columns={columns} setColumns={setColumns} />
      </div>
      {showOverlay && (
        <CardDetails
          card={selectedCard}
          onClose={() => {
            setShowOverlay(false);
            setSelectedCard(null);
          }}
          setColumns={setColumns}
          columns={columns}
        />
      )}
    </div>
  );
}
