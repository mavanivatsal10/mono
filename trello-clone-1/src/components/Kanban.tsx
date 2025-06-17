import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragOverEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import Column from "./Column";

export default function Kanban() {
  const [columns, setColumns] = useState({
    todo: ["task 1", "task 2"],
    inProgress: ["task 3", "task 4"],
    done: ["task 5", "task 6"],
  });

  const getSensors = () => {
    const mouseSensor = useSensor(MouseSensor, {
      activationConstraint: { distance: 2 },
    });
    const touchSensor = useSensor(TouchSensor);
    const keyboardSensor = useSensor(KeyboardSensor);
    return [mouseSensor, touchSensor, keyboardSensor];
  };

  const handleDragOver = (e: DragOverEvent) => {
    if (
      e.active.id.startsWith("draggable-card-") &&
      e.over?.id.startsWith("droppable-card-") &&
      e.active.id.split("-")[2] === e.over?.id.split("-")[2]
    )
      return;

    const activeElement = e.active.data.current;

    if (activeElement.parent === e.over?.id) return;

    if (["todo", "inProgress", "done"].includes(e.over?.id)) {
      setColumns((prev) => {
        const temp = { ...prev };
        temp[e.over.id] = [...temp[e.over.id], activeElement.card];
        temp[activeElement.parent] = temp[activeElement.parent].filter(
          (card) => card !== activeElement.card
        );
        return temp;
      });
    } else if (e.over?.id.startsWith("droppable-card-")) {
      if (e.over?.data.current.parent !== activeElement.parent) {
        // different column
        setColumns((prev) => {
          const temp = { ...prev };
          temp[activeElement.parent] = temp[activeElement.parent].filter(
            (card) => card !== activeElement.card
          );
          const targetColumn = e.over?.data.current.parent;
          const targetCards = [...temp[targetColumn]];
          const overIdx = targetCards.indexOf(e.over?.data.current.card);
          targetCards.splice(overIdx, 0, activeElement.card);
          temp[targetColumn] = targetCards;
          return temp;
        });
      } else {
        // same column
        setColumns((prev) => {
          const temp = { ...prev };
          const cards = [...temp[activeElement.parent]];
          const overIdx = cards.indexOf(e.over?.data.current.card);
          const activeIdx = cards.indexOf(activeElement.card);
          cards.splice(overIdx, 0, cards.splice(activeIdx, 1)[0]);
          temp[activeElement.parent] = cards;
          return temp;
        });
      }
    }
  };

  return (
    <div>
      <DndContext
        onDragOver={handleDragOver}
        sensors={useSensors(...getSensors())}
      >
        <div className="flex gap-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <Column
              key={columnId}
              title={columnId}
              cards={column}
              setColumns={setColumns}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
