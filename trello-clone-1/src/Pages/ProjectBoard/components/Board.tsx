import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragOverEvent,
} from "@dnd-kit/core";
import Column from "./Column";
import Filter from "./Filter";
import { useNavigate, useParams } from "react-router-dom";
import { GlobalContext } from "@/contexts/GlobalContext";
import { useContext } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

export default function Kanban({ columns, setColumns }) {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 2 },
  });
  const touchSensor = useSensor(TouchSensor);
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);
  const { projectId } = useParams();
  const { userData, baseURL, setUserData } = useContext(GlobalContext);
  const navigate = useNavigate();

  const handleDragOver = async (e: DragOverEvent) => {
    if (
      e.active.id.toString().startsWith("draggable-card-") &&
      e.over?.id.toString().startsWith("droppable-card-") &&
      e.active.id.toString().split("-")[2] ===
        e.over?.id.toString().split("-")[2]
    )
      return;

    const activeElement = e.active.data.current;

    if (activeElement.parent === e.over?.id) return;

    const handleColumnDrop = async () => {
      const sourceColumn = activeElement.parent;
      const targetColumn = e.over?.id;
      const updatedSourceCards = columns[sourceColumn].filter(
        (card) => card.id !== activeElement.card.id
      );
      const updatedTargetCards = [...columns[targetColumn], activeElement.card];
      const updatedColumns = {
        ...columns,
        [sourceColumn]: updatedSourceCards,
        [targetColumn]: updatedTargetCards,
      };
      setColumns(updatedColumns);
      const updatedUserData = {
        ...userData,
        projects: userData.projects.map((project) => {
          if (project.id === projectId) {
            return {
              ...project,
              cards: updatedColumns,
            };
          }
          return project;
        }),
      };
      setUserData(updatedUserData);
      window.localStorage.setItem("userData", JSON.stringify(updatedUserData));
      await axios.patch(`${baseURL}/users/${userData.id}`, updatedUserData);
    };

    const handleCardDrop = async () => {
      const sourceColumn = activeElement.parent;
      const targetColumn = e.over?.data.current.parent;

      const handleDifferentColumn = async () => {
        const updatedSourceCards = columns[sourceColumn].filter(
          (card) => card.id !== activeElement.card.id
        );
        const updatedTargetCards = [...columns[targetColumn]];
        const overIdx = updatedTargetCards.findIndex(
          (card) => card.id === e.over?.data.current.card.id
        );
        updatedTargetCards.splice(overIdx, 0, activeElement.card);
        const updatedColumns = {
          ...columns,
          [sourceColumn]: updatedSourceCards,
          [targetColumn]: updatedTargetCards,
        };
        setColumns(updatedColumns);
        const updatedUserData = {
          ...userData,
          projects: userData.projects.map((project) => {
            if (project.id === projectId) {
              return {
                ...project,
                cards: updatedColumns,
              };
            }
            return project;
          }),
        };
        setUserData(updatedUserData);
        window.localStorage.setItem(
          "userData",
          JSON.stringify(updatedUserData)
        );
        await axios.patch(`${baseURL}/users/${userData.id}`, updatedUserData);
      };
      const handleSameColumn = () => {
        const cards = columns[sourceColumn];
        const overIdx = cards.findIndex(
          (card) => card.id === e.over?.data.current.card.id
        );
        const activeIdx = cards.findIndex(
          (card) => card.id === activeElement.card.id
        );
        const updatedCards = [...cards];
        updatedCards.splice(overIdx, 0, updatedCards.splice(activeIdx, 1)[0]);
        setColumns((prev) => ({
          ...prev,
          [sourceColumn]: updatedCards,
        }));
        const updatedUserData = {
          ...userData,
          projects: userData.projects.map((project) => {
            if (project.id === projectId) {
              return {
                ...project,
                cards: {
                  ...project.cards,
                  [sourceColumn]: updatedCards,
                },
              };
            }
            return project;
          }),
        };
        setUserData(updatedUserData);
        window.localStorage.setItem(
          "userData",
          JSON.stringify(updatedUserData)
        );
        axios.patch(`${baseURL}/users/${userData.id}`, updatedUserData);
      };

      if (e.over?.data.current.parent !== activeElement.parent) {
        await handleDifferentColumn();
      } else {
        await handleSameColumn();
      }
    };

    if (["todo", "inProgress", "done"].includes(e.over?.id)) {
      await handleColumnDrop();
    } else if (e.over?.id.startsWith("droppable-card-")) {
      await handleCardDrop();
    }
  };

  return (
    <div className="m-4 sleect-none">
      <div
        className="flex gap-2 text-gray-500 cursor-pointer select-none"
        onClick={() => navigate("/")}
      >
        <ArrowLeft />
        <p>Go back to the dashboard</p>
      </div>
      <Filter columns={columns} setColumns={setColumns} />
      <DndContext onDragOver={handleDragOver} sensors={sensors}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <Column
              key={columnId}
              title={columnId}
              cards={column}
              setColumns={setColumns}
              columns={columns}
            />
          ))}
        </div>
      </DndContext>
      <div className="flex justify-center items-center my-8 text-gray-500">
        Signed in as: {userData.name} | {userData.email}
      </div>
    </div>
  );
}
