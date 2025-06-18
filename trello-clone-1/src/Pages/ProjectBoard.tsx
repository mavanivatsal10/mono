import CardDetails from "@/components/CardDetails";
import Kanban from "@/components/Kanban";
import type { projectDetailsType } from "@/types";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function ProjectBoard({ data }: { data: projectDetailsType }) {
  // these states can be lifted to a context
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

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

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowOverlay(false);
        setSelectedCard(null);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, []);

  return (
    <div>
      <div className={`${showOverlay ? "blur-sm opacity-75" : ""}`}>
        <Kanban
          setShowOverlay={setShowOverlay}
          showOverlay={showOverlay}
          setSelectedCard={setSelectedCard}
          columns={columns}
          setColumns={setColumns}
        />
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
