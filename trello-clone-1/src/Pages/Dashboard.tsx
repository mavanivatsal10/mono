import { Separator } from "@/components/ui/separator";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { GlobalContext } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import Bin from "@/icons/Bin";
import { SquarePen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { updateUserObject } from "@/api/user";

export default function Dashboard() {
  const { userData, setUserData } = useContext(GlobalContext);
  const navigate = useNavigate();

  const tableData = userData.projects.map((project) => {
    return {
      id: project.id,
      title: project.title,
      todo: project.cards.todo.length,
      inProgress: project.cards.inProgress.length,
      done: project.cards.done.length,
    };
  });

  const [isEditTitle, setIsEditTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const handleEditTitle = (row: typeof tableData) => {
    setIsEditTitle(true);
    setEditTitle(row.title);
  };

  const handleSaveEditTitle = async (row: typeof tableData) => {
    setIsEditTitle(false);
    const updatedProjects = userData.projects.map((project) => {
      if (project.id === row.id) {
        return { ...project, title: editTitle };
      }
      return project;
    });
    const updatedUserData = { ...userData, projects: updatedProjects };
    setUserData(updatedUserData);
    window.localStorage.setItem("userData", JSON.stringify(updatedUserData));
    await updateUserObject(userData.id, updatedUserData);
  };

  const handleDeleteProject = async (row: typeof tableData) => {
    const updatedProjects = userData.projects.filter(
      (project) => project.id !== row.id
    );
    const updatedUserData = { ...userData, projects: updatedProjects };
    setUserData(updatedUserData);
    window.localStorage.setItem("userData", JSON.stringify(updatedUserData));
    await updateUserObject(userData.id, updatedUserData);
  };

  const dashboardColumns = [
    {
      name: "Project Title",
      sortable: true,
      minWidth: "250px",
      cell: (row: typeof tableData) => {
        return isEditTitle ? (
          <div className="flex gap-2">
            <Input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => handleSaveEditTitle(row)}
            />
            <Button
              variant="secondary"
              onClick={() => handleSaveEditTitle(row)}
            >
              Save
            </Button>
          </div>
        ) : (
          row.title
        );
      },
    },
    {
      name: "Todo",
      selector: (row: typeof tableData) => row.todo,
      sortable: true,
    },
    {
      name: "In Progress",
      selector: (row: typeof tableData) => row.inProgress,
      sortable: true,
      minWidth: "125px",
    },
    {
      name: "Done",
      selector: (row: typeof tableData) => row.done,
      sortable: true,
    },
    {
      name: "Edit Title",
      cell: (row: typeof tableData) => {
        return (
          <button
            className="text-gray-500"
            onClick={() => handleEditTitle(row)}
          >
            <SquarePen />
          </button>
        );
      },
    },
    {
      name: "Delete",
      cell: (row: typeof tableData) => {
        return (
          <button onClick={() => handleDeleteProject(row)}>
            <Bin />
          </button>
        );
      },
    },
  ];

  const handleRowClick = (row: typeof tableData) => {
    navigate(`/projectboard/${row.id}`);
  };

  const handleAddProject = async () => {
    const newProject = {
      id: uuidv4(),
      title: "New Project",
      cards: { todo: [], inProgress: [], done: [] },
    };
    const updatedProjects = [...userData.projects, newProject];
    const updatedUserData = { ...userData, projects: updatedProjects };
    setUserData(updatedUserData);
    window.localStorage.setItem("userData", JSON.stringify(updatedUserData));
    await updateUserObject(userData.id, updatedUserData);
  };

  return (
    <div className="flex flex-col gap-8 items-center justify-center my-20">
      <div className="flex justify-center items-center">
        <div className="text-5xl font-semibold rounded-full bg-muted size-24 flex justify-center items-center">
          {userData.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col ml-4">
          <div className="text-4xl font-semibold mb-2">{userData.name}</div>
          <Separator />
          <div className="text-sm mt-2 text-muted-foreground">
            {userData.email} | {userData.position}
          </div>
        </div>
      </div>
      <div>
        <DataTable
          columns={dashboardColumns}
          data={tableData}
          pagination
          paginationPerPage={5}
          paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
          pointerOnHover
          highlightOnHover
          onRowClicked={handleRowClick}
        />
      </div>
      <div>
        <Button onClick={handleAddProject}>Add New Project</Button>
      </div>
    </div>
  );
}
