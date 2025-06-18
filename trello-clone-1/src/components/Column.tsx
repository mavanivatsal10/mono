import { useDroppable } from "@dnd-kit/core";
import Card from "./Card";
import Plus from "@/icons/Plus";
import { v4 as uuidv4 } from "uuid";

export default function Column({
  title,
  cards,
  setColumns,
  showOverlay,
  setShowOverlay,
  setSelectedCard,
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: title,
  });

  const addCard = () => {
    setColumns((prev) => {
      return {
        ...prev,
        [title]: [
          ...prev[title],
          { id: uuidv4(), title: `Card ${prev[title].length + 1}` },
        ],
      };
    });
  };

  const getTitle = (title: string) => {
    switch (title) {
      case "todo":
        return "To do";
      case "inProgress":
        return "In progress";
      case "done":
        return "Done";
    }
  };

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-200 m-2 w-1/4 rounded-3xl shadow-lg"
    >
      <h3 className="flex justify-center items-center font-semibold text-xl p-4 text-white bg-gradient-to-b from-gray-600 to-gray-800 rounded-t-3xl">
        {getTitle(title)}
      </h3>
      {cards.map((card) => (
        <Card
          card={card}
          key={card.id}
          parent={title}
          setColumns={setColumns}
          onClick={() => {
            setShowOverlay(true);
            setSelectedCard(card);
          }}
        />
      ))}
      <button
        className="flex justify-center items-center gap-2 w-full p-4 text-gray-500"
        onClick={addCard}
      >
        <Plus />
        <div>Add a card</div>
      </button>
    </div>
  );
}
