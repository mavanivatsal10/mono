import { ChartNoAxesColumn, Clock, ScrollText } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import CardDetailsEdit from "./CardDetailsEdit";
import X from "@/icons/X";
import { format } from "date-fns";
import { Button } from "../../../components/ui/button";
import { ProjectBoardContext } from "@/contexts/ProjectBoardContext";

export default function CardDetails({ card, onClose, setColumns, columns }) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // close popup on
  // a. click outside the popup
  // b. escape key press
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !isEditMode &&
        popupRef.current &&
        !popupRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    setIsEditMode(false);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  return isEditMode ? (
    <CardDetailsEdit
      card={card}
      onClose={onClose}
      setColumns={setColumns}
      columns={columns}
    />
  ) : (
    <ShowCardDetails
      ref={popupRef}
      card={card}
      onClose={onClose}
      setIsEditMode={setIsEditMode}
      columns={columns}
    />
  );
}

function ShowCardDetails({ ref, card, onClose, setIsEditMode, columns }) {
  const { getTitle } = useContext(ProjectBoardContext);
  const findColumn = () => {
    for (const key in columns) {
      if (columns[key].some((c) => c.id === card.id)) {
        return key;
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center">
      <div
        className="min-h-1/2 w-full m-4 p-6  md:m-0 md:w-1/2 bg-white rounded-2xl shadow-2xl flex flex-col gap-4"
        ref={ref}
      >
        <div className="flex justify-between">
          <h3 className="text-3xl line-clamp-2">{card.title}</h3>
          <div onClick={onClose} className="cursor-pointer">
            <X className="text-gray-500 rounded-full hover:bg-gray-200 h-8 w-8 p-1" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h5 className="flex gap-2 font-semibold group items-center">
            <ScrollText className="text-gray-500" />
            <div>Description</div>
          </h5>
          <div className="ml-8 break-words text-gray-700">
            {card.description ? card.description : "No description added yet."}
          </div>
        </div>
        <div className="flex gap-2">
          <Clock className="text-gray-500" />
          <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-4">
            <div className="flex flex-col gap-2">
              <h6 className="font-semibold">Start Date</h6>
              <div>
                {card.startDate
                  ? format(card.startDate, "PP")
                  : "Not specified"}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h6 className="font-semibold">Due Date</h6>
              <div>
                {card.endDate ? format(card.endDate, "PP") : "Not specified"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h5 className="flex gap-2 font-semibold group items-center">
            <ChartNoAxesColumn className="text-gray-500" />
            <div>Status</div>
          </h5>
          <div className="ml-8">{getTitle(findColumn())}</div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => setIsEditMode(true)}>Edit</Button>
        </div>
      </div>
    </div>
  );
}
