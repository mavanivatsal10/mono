import { createContext, useState } from "react";

export const ProjectBoardContext = createContext();

export const ProjectBoardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [filter, setFilter] = useState("all");

  const getTitle = (title: string) => {
    switch (title) {
      case "todo":
        return "To Do";
      case "inProgress":
        return "In Progress";
      case "done":
        return "Done";
    }
  };

  return (
    <ProjectBoardContext.Provider
      value={{
        showOverlay,
        setShowOverlay,
        selectedCard,
        setSelectedCard,
        filter,
        setFilter,
        getTitle,
      }}
    >
      {children}
    </ProjectBoardContext.Provider>
  );
};
