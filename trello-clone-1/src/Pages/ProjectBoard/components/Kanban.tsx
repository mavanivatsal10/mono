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
import deepcopy from "deepcopy";
import Filter from "./Filter";

export default function Kanban({ columns, setColumns }) {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 2 },
  });
  const touchSensor = useSensor(TouchSensor);
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const handleDragOver = (e: DragOverEvent) => {
    if (
      e.active.id.toString().startsWith("draggable-card-") &&
      e.over?.id.toString().startsWith("droppable-card-") &&
      e.active.id.toString().split("-")[2] ===
        e.over?.id.toString().split("-")[2]
    )
      return;

    const activeElement = e.active.data.current;

    if (activeElement.parent === e.over?.id) return;

    if (["todo", "inProgress", "done"].includes(e.over?.id)) {
      // dropping on a column
      setColumns((prev) => {
        const temp = deepcopy(prev);
        temp[e.over.id] = [...temp[e.over.id], activeElement.card];
        temp[activeElement.parent] = temp[activeElement.parent].filter(
          (card) => card.id !== activeElement.card.id
        );
        return temp;
      });
    } else if (e.over?.id.startsWith("droppable-card-")) {
      // dropping on a card
      if (e.over?.data.current.parent !== activeElement.parent) {
        // different column
        setColumns((prev) => {
          const temp = deepcopy(prev);
          temp[activeElement.parent] = temp[activeElement.parent].filter(
            (card) => card.id !== activeElement.card.id
          );
          const targetColumn = e.over?.data.current.parent;
          const targetCards = [...temp[targetColumn]];
          const overIdx = targetCards.findIndex(
            (card) => card.id === e.over?.data.current.card.id
          );
          targetCards.splice(overIdx, 0, activeElement.card);
          temp[targetColumn] = targetCards;
          return temp;
        });
      } else {
        // same column
        setColumns((prev) => {
          const temp = deepcopy(prev);
          const cards = temp[activeElement.parent];
          const overIdx = cards.findIndex(
            (card) => card.id === e.over?.data.current.card.id
          );
          const activeIdx = cards.findIndex(
            (card) => card.id === activeElement.card.id
          );
          cards.splice(overIdx, 0, cards.splice(activeIdx, 1)[0]);
          temp[activeElement.parent] = cards;
          return temp;
        });
      }
    }
  };

  return (
    <div className="m-4 sleect-none">
      <Filter columns={columns} setColumns={setColumns} />
      <DndContext onDragOver={handleDragOver} sensors={sensors}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
