import Bin from "@/icons/Bin";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import deepcopy from "deepcopy";

interface Props {
  card: any;
  parent: string;
  setColumns: any;
}

export default function Card({ card, parent, setColumns, onClick }: Props) {
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

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const removeCard = () => {
    setColumns((prev) => {
      const temp = deepcopy(prev);
      temp[parent] = temp[parent].filter((c) => c.id !== card.id);
      return temp;
    });
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
