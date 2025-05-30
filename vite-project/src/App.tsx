import { Route, Routes } from "react-router";
import MyDataTable from "./MyDataTable";
import { Form } from "./Form";

function App() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
      <Routes>
        <Route path="/react-data-table" element={<MyDataTable />} />
        <Route path="/normal" element={<Form />} />
      </Routes>
    </div>
  );
}

export default App;
