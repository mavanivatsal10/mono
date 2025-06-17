import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function Card({ card, parent }) {
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `droppable-card-${card}`,
    data: { type: `droppable-card-${card}`, card, parent },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    transform,
  } = useDraggable({
    id: `draggable-card-${card}`,
    data: { type: `draggable-card-${card}`, card, parent },
  });

  const setRef = (el: HTMLElement | null) => {
    setDraggableNodeRef(el);
    setDroppableNodeRef(el);
  };

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setRef}
      {...listeners}
      {...attributes}
      style={style}
      className="m-2 p-4 border-2 bg-white rounded-md"
    >
      {card}
    </div>
  );
}
