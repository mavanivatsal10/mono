import CardDetails from "@/pages/ProjectBoard/components/CardDetails";
import Kanban from "@/pages/ProjectBoard/components/Kanban";
import { ProjectBoardContext } from "@/contexts/ProjectBoardContext";
import { useContext, useState } from "react";
import { GlobalContext } from "@/contexts/GlobalContext";
import { useParams } from "react-router-dom";

export default function ProjectBoard() {
  const { showOverlay, setShowOverlay, selectedCard, setSelectedCard } =
    useContext(ProjectBoardContext);
  const { userData } = useContext(GlobalContext);
  const { projectId } = useParams();

  const [columns, setColumns] = useState(
    userData.projects.find((p) => p.id === projectId)?.cards
  );

  if (!columns)
    return (
      <p>do something here. either auth failed or project is still loading</p>
    );

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
