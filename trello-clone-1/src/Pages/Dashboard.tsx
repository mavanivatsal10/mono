import { Separator } from "@/components/ui/separator";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { GlobalContext } from "@/contexts/GlobalContext";

export default function Dashboard() {
  const { userData } = useContext(GlobalContext);
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

  const dashboardColumns = [
    {
      name: "Project Title",
      selector: (row: typeof tableData) => row.title,
      sortable: true,
      minWidth: "250px",
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
  ];

  const handleRowClick = (row: typeof tableData) => {
    navigate(`/projectboard/${row.id}`);
  };

  return (
    <div className="flex flex-col gap-8 items-center justify-center my-12">
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
          pointerOnHover
          highlightOnHover
          onRowClicked={handleRowClick}
        />
      </div>
    </div>
  );
}
