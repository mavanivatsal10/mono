import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";

export default function Card({ card, parent, setColumns }) {
  const [edit, setEdit] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [inputVal, setInputVal] = useState(card);

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
    cardRef.current = el;
  };

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  useEffect(() => {
    // document.addEvenListener: when mouse clicks outside or enter is pressed, setEdit(false)
  }, []);

  return (
    <div
      ref={setRef}
      {...listeners}
      {...attributes}
      style={style}
      className="m-2 p-4 border-2 bg-white rounded-md shadow-md"
    >
      {edit ? (
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
        />
      ) : (
        <p onClick={() => setEdit(true)}>{card}</p>
      )}
    </div>
  );
}
