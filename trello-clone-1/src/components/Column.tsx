import { useDroppable } from "@dnd-kit/core";
import Card from "./Card";
import Plus from "@/icons/Plus";

export default function Column({ title, cards, setColumns }) {
  const { isOver, setNodeRef } = useDroppable({
    id: title,
  });
  return (
    <div ref={setNodeRef} className="bg-gray-200 m-2 w-75">
      <h3 className="flex justify-center items-center font-semibold text-xl p-4 text-white bg-gradient-to-b from-gray-600 to-gray-800">
        {title}
      </h3>
      {cards.map((card) => (
        <Card card={card} key={card} parent={title} setColumns={setColumns} />
      ))}
      <button className="flex justify-center items-center gap-2 w-full p-4 text-gray-500">
        <Plus />
        <div>Add a card</div>
      </button>
    </div>
  );
}
