import { useDroppable } from "@dnd-kit/core";
import Card from "./Card";
import Plus from "@/icons/Plus";
import { v4 as uuidv4 } from "uuid";
import { useContext } from "react";
import { ProjectBoardContext } from "@/contexts/ProjectBoardContext";
import { addDays, endOfDay, isBefore, isToday, startOfDay } from "date-fns";
import { GlobalContext } from "@/contexts/GlobalContext";
import axios from "axios";
import { useParams } from "react-router-dom";
import { updateUserObject } from "@/api/user";

export default function Column({ title, cards, setColumns, columns }) {
  const { setShowOverlay, setSelectedCard, getTitle, filter } =
    useContext(ProjectBoardContext);
  const { baseURL, userData, setUserData } = useContext(GlobalContext);

  const { setNodeRef } = useDroppable({
    id: title,
  });
  const { projectId } = useParams();

  const addCard = async () => {
    // update the server with the new card
    const newCard = {
      id: uuidv4(),
      title: "New Card",
      description: "",
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
    };
    const updatedCards = [...cards, newCard];
    setColumns((prev) => ({
      ...prev,
      [title]: updatedCards,
    }));
    const updatedUserData = {
      ...userData,
      projects: userData.projects.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            cards: {
              ...project.cards,
              [title]: updatedCards,
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

  const filteredCards = cards.filter((card) => {
    const endDate = startOfDay(new Date(card.endDate));
    const today = startOfDay(new Date());
    let numAddDays = 0;

    if (filter === "all") return true;
    else if (filter === "overdue") {
      return isBefore(endDate, today);
    } else if (filter === "today") {
      return isToday(endDate);
    } else if (filter === "tomorrow") {
      numAddDays = 1;
    } else if (filter === "week") {
      numAddDays = 7;
    } else if (filter === "month") {
      numAddDays = 30;
    }

    const notOverdue = !isBefore(endDate, today);
    const dueDay = endOfDay(addDays(today, numAddDays));
    console.log(dueDay);
    return notOverdue && isBefore(endDate, dueDay);
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
          columns={columns}
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
