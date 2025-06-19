import { createContext } from "react";
import { v4 as uuidv4 } from "uuid";

export const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const baseURL = "http://localhost:3000";

  const userData = {
    name: "john doe",
    email: "j@j.com",
    position: "developer",
    projects: [
      {
        id: uuidv4(),
        title: "my first project",
        cards: {
          todo: [
            {
              id: uuidv4(),
              title:
                "task 1 mmmmmmmmmmmmmmm mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmm mmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmmmmm mmmmmmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmmmm mmmmmmmmmmmmmmm mmmmmmmmmmmmm",
              description:
                "task 1 description mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmm mmmmmmmmmm",
              startDate: new Date(),
              endDate: new Date(),
            },
            {
              id: uuidv4(),
              title: "task 2",
              description: "task 2 description",
              startDate: new Date(),
              endDate: new Date(),
            },
          ],
          inProgress: [
            {
              id: uuidv4(),
              title: "task 3",
              description: "task 3 description",
              startDate: new Date(),
              endDate: new Date(),
            },
            {
              id: uuidv4(),
              title: "task 4",
              description: "task 4 description",
              startDate: new Date(),
              endDate: new Date(),
            },
          ],
          done: [
            {
              id: uuidv4(),
              title: "task 5",
              description: "task 5 description",
              startDate: new Date(),
              endDate: new Date(),
            },
            {
              id: uuidv4(),
              title: "task 6",
              description: "task 6 description",
              startDate: new Date(),
              endDate: new Date(),
            },
          ],
        },
      },
      {
        id: uuidv4(),
        title: "my second project",
        cards: {
          todo: [
            {
              id: uuidv4(),
              title: "task 2",
              description: "task 2 description",
              startDate: new Date(),
              endDate: new Date(),
            },
          ],
          inProgress: [
            {
              id: uuidv4(),
              title: "task 3",
              description: "task 3 description",
              startDate: new Date(),
              endDate: new Date(),
            },
            {
              id: uuidv4(),
              title: "task 4",
              description: "task 4 description",
              startDate: new Date(),
              endDate: new Date(),
            },
          ],
          done: [
            {
              id: uuidv4(),
              title: "task 5",
              description: "task 5 description",
              startDate: new Date(),
              endDate: new Date(),
            },
          ],
        },
      },
    ],
  };

  return (
    <GlobalContext.Provider value={{ baseURL, userData }}>
      {children}
    </GlobalContext.Provider>
  );
}
