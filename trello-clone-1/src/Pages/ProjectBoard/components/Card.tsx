import { updateUserObject } from "@/api/user";
import { GlobalContext } from "@/contexts/GlobalContext";
import Bin from "@/icons/Bin";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import axios from "axios";
import deepcopy from "deepcopy";
import { useContext } from "react";
import { useParams } from "react-router-dom";

interface Props {
  card: any;
  parent: string;
  setColumns: any;
}

export default function Card({
  card,
  parent,
  setColumns,
  onClick,
  columns,
}: Props) {
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `droppable-card-${card.id}`,
    data: { type: `droppable-card-${card.id}`, card, parent },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `draggable-card-${card.id}`,
    data: { type: `draggable-card-${card.id}`, card, parent },
  });

  const setRef = (el: HTMLElement | null) => {
    setDraggableNodeRef(el);
    setDroppableNodeRef(el);
  };

  const { projectId } = useParams();

  const { userData, baseURL, setUserData } = useContext(GlobalContext);

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const removeCard = async () => {
    const updatedColumns = deepcopy(columns);
    const updatedCards = updatedColumns[parent].filter((c) => c.id !== card.id);
    updatedColumns[parent] = updatedCards;
    setColumns(updatedColumns);
    const updatedUserData = {
      ...userData,
      projects: userData.projects.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            cards: {
              ...project.cards,
              [parent]: updatedCards,
            },
          };
        }
        return project;
      }),
    };
    setUserData(updatedUserData);
    window.localStorage.setItem("userData", JSON.stringify(updatedUserData));
    await updateUserObject(userData.id, updatedUserData);
  };

  return (
    <div
      ref={setRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`m-2 p-4 border-2 bg-white rounded-md shadow-md relative group ${
        isDragging ? "z-40 cursor-grabbing" : "cursor-grab"
      }`}
      onClick={onClick}
    >
      <p className="break-words pr-4 line-clamp-5">{card.title}</p>
      <button
        className="absolute top-1/2 right-2 -translate-y-1/2 group-hover:opacity-75 opacity-0 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          removeCard();
        }}
      >
        {!isDragging && <Bin />}
      </button>
    </div>
  );
}
