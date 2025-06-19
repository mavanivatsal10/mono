import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useContext } from "react";
import { ProjectBoardContext } from "@/contexts/ProjectBoardContext";

export default function Filter() {
  const { setFilter } = useContext(ProjectBoardContext);

  return (
    <div className="flex items-center justify-center mb-4 gap-4">
      <p className="text-gray-700">Filter by: </p>
      <div className="select-none">
        <Select onValueChange={(value) => setFilter(value)}>
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Select a filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Show All Cards</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Due date</SelectLabel>
              <SelectItem value="today">Due Today</SelectItem>
              <SelectItem value="tomorrow">Due Tomorrow</SelectItem>
              <SelectItem value="week">Due in the next 7 days</SelectItem>
              <SelectItem value="month">Due in Next Month</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
