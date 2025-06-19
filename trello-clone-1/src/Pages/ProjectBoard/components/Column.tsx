import { useDroppable } from "@dnd-kit/core";
import Card from "./Card";
import Plus from "@/icons/Plus";
import { v4 as uuidv4 } from "uuid";
import { useContext } from "react";
import { ProjectBoardContext } from "@/contexts/ProjectBoardContext";
import { addDays } from "date-fns";

export default function Column({ title, cards, setColumns }) {
  const { setShowOverlay, setSelectedCard, getTitle, filter } =
    useContext(ProjectBoardContext);
  const { isOver, setNodeRef } = useDroppable({
    id: title,
  });

  const addCard = () => {
    // !card
    setColumns((prev) => {
      return {
        ...prev,
        [title]: [
          ...prev[title],
          {
            id: uuidv4(),
            title: `Card ${prev[title].length + 1}`,
            startDate: new Date(),
            description: "",
          },
        ],
      };
    });
  };

  const filteredCards = cards.filter((card) => {
    if (filter === "all") return true;
    else if (filter === "today") {
      return card.endDate <= new Date();
    } else if (filter === "tomorrow") {
      return card.endDate <= addDays(new Date(), 1);
    } else if (filter === "week") {
      return card.endDate <= addDays(new Date(), 7);
    } else if (filter === "month") {
      return card.endDate <= addDays(new Date(), 30);
    } else return true; // Default case, return all cards
  });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-200 m-2 rounded-3xl shadow-lg select-none"
    >
      <h3 className="flex justify-center items-center font-semibold text-xl p-4 text-white bg-gradient-to-b from-gray-600 to-gray-800 rounded-t-3xl">
        {getTitle(title)}
      </h3>
      {filteredCards.map((card) => (
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
        className="flex justify-center items-center gap-2 w-full p-4 text-gray-500 cursor-pointer"
        onClick={addCard}
      >
        <Plus />
        <div>Add a card</div>
      </button>
    </div>
  );
}
