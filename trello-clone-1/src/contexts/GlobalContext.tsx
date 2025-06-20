import { createContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import fs from "fs";
import { id } from "date-fns/locale";

export const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const baseURL = "http://localhost:3000";

  // const userData = [
  //   {
  //     id: uuidv4(),
  //     name: "John Doe",
  //     email: "j@j.com",
  //     position: "developer",
  //     projects: [
  //       {
  //         id: uuidv4(),
  //         title: "my first project",
  //         cards: {
  //           todo: [
  //             {
  //               id: uuidv4(),
  //               title:
  //                 "task 1 mmmmmmmmmmmmmmm mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmm mmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmmmmm mmmmmmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmmmm mmmmmmmmmmmmmmm mmmmmmmmmmmmm",
  //               description:
  //                 "task 1 description mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmm mmmmmmmmmm",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 2",
  //               description: "task 2 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //           inProgress: [
  //             {
  //               id: uuidv4(),
  //               title: "task 3",
  //               description: "task 3 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 4",
  //               description: "task 4 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //           done: [
  //             {
  //               id: uuidv4(),
  //               title: "task 5",
  //               description: "task 5 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 6",
  //               description: "task 6 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         id: uuidv4(),
  //         title: "my first project",
  //         cards: {
  //           todo: [
  //             {
  //               id: uuidv4(),
  //               title:
  //                 "task 1 mmmmmmmmmmmmmmm mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmm mmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmmmmm mmmmmmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmmmm mmmmmmmmmmmmmmm mmmmmmmmmmmmm",
  //               description:
  //                 "task 1 description mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmm mmmmmmmmmm",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 2",
  //               description: "task 2 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //           inProgress: [
  //             {
  //               id: uuidv4(),
  //               title: "task 3",
  //               description: "task 3 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 3",
  //               description: "task 3 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 4",
  //               description: "task 4 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //           done: [
  //             {
  //               id: uuidv4(),
  //               title: "task 5",
  //               description: "task 5 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 6",
  //               description: "task 6 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         id: uuidv4(),
  //         title: "my first project",
  //         cards: {
  //           todo: [
  //             {
  //               id: uuidv4(),
  //               title: "task 2",
  //               description: "task 2 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //           inProgress: [
  //             {
  //               id: uuidv4(),
  //               title: "task 3",
  //               description: "task 3 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 4",
  //               description: "task 4 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //           done: [],
  //         },
  //       },
  //     ],
  //   },
  //   {
  //     id: uuidv4(),
  //     name: "Jane Doe",
  //     email: "j@j.com",
  //     position: "manager",
  //     projects: [
  //       {
  //         id: uuidv4(),
  //         title: "my first project",
  //         cards: {
  //           todo: [
  //             {
  //               id: uuidv4(),
  //               title:
  //                 "task 1 mmmmmmmmmmmmmmm mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmm mmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmmmmm mmmmmmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmmmm mmmmmmmmmmmmmmm mmmmmmmmmmmmm",
  //               description:
  //                 "task 1 description mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmm mmmmmmmmmm",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 2",
  //               description: "task 2 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //           inProgress: [
  //             {
  //               id: uuidv4(),
  //               title: "task 3",
  //               description: "task 3 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 4",
  //               description: "task 4 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //           done: [
  //             {
  //               id: uuidv4(),
  //               title: "task 5",
  //               description: "task 5 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 6",
  //               description: "task 6 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         id: uuidv4(),
  //         title: "my first project",
  //         cards: {
  //           todo: [
  //             {
  //               id: uuidv4(),
  //               title:
  //                 "task 1 mmmmmmmmmmmmmmm mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmm mmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmmmmm mmmmmmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmmmm mmmmmmmmmmmmmmm mmmmmmmmmmmmm",
  //               description:
  //                 "task 1 description mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm mmmmmmmmmmmmmm mmmmmmmmmm mmmmmmmmmm",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 2",
  //               description: "task 2 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //           inProgress: [
  //             {
  //               id: uuidv4(),
  //               title: "task 3",
  //               description: "task 3 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 3",
  //               description: "task 3 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 4",
  //               description: "task 4 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //           done: [
  //             {
  //               id: uuidv4(),
  //               title: "task 5",
  //               description: "task 5 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 6",
  //               description: "task 6 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         id: uuidv4(),
  //         title: "my first project",
  //         cards: {
  //           todo: [
  //             {
  //               id: uuidv4(),
  //               title: "task 2",
  //               description: "task 2 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //           inProgress: [
  //             {
  //               id: uuidv4(),
  //               title: "task 3",
  //               description: "task 3 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //             {
  //               id: uuidv4(),
  //               title: "task 4",
  //               description: "task 4 description",
  //               startDate: new Date().toISOString(),
  //               endDate: new Date().toISOString(),
  //             },
  //           ],
  //           done: [],
  //         },
  //       },
  //     ],
  //   },
  // ];

  const user = JSON.parse(window.localStorage.getItem("userData")) || null;
  const [userData, setUserData] = useState(user);

  return (
    <GlobalContext.Provider
      value={{ baseURL, userData, userData, setUserData }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
