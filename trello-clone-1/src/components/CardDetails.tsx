import X from "@/icons/X";
import { Clock, Edit, ScrollText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
import deepcopy from "deepcopy";
import { DatePicker } from "./ui/date-picker";

export default function CardDetails({ card, onClose, setColumns, columns }) {
  const popupRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const [editDesc, setEditDesc] = useState(false);
  const [desc, setDesc] = useState(card.description);
  const [startDate, setStartDate] = useState<Date>(card.startDate);
  const startDateRef = useRef<HTMLInputElement>(null);
  const [endDate, setEndDate] = useState<Date>(card.endDate);
  const endDateRef = useRef<HTMLInputElement>(null);

  const findColumn = () => {
    for (const key in columns) {
      if (columns[key].some((c) => c.id === card.id)) {
        return key;
      }
    }
  };

  useEffect(() => {
    // close pop up on click outside
    const handleClickOutside = (e: MouseEvent) => {
      // e.stopPropagation(); // uncomment if bug
      if (
        startDateRef.current?.contains(e.target as Node) ||
        endDateRef.current?.contains(e.target as Node)
      )
        return;
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    // change card.description on click outside desc text area
    const handleChangeDesc = (e: MouseEvent) => {
      e.stopPropagation();
      if (descRef.current && !descRef.current.contains(e.target as Node)) {
        setColumns((prev) => {
          const temp = deepcopy(prev);
          const column = findColumn();
          temp[column] = temp[column].map((c) => {
            if (c.id === card.id) {
              return { ...c, description: desc };
            }
            return c;
          });
          return temp;
        });
        setEditDesc(false);
      }
    };
    document.addEventListener("mousedown", handleChangeDesc);
    return () => document.removeEventListener("mousedown", handleChangeDesc);
  }, [descRef]);

  useEffect(() => {
    setColumns((prev) => {
      const temp = deepcopy(prev);
      const column = findColumn();
      temp[column] = temp[column].map((c) => {
        if (c.id === card.id) {
          return { ...c, startDate, endDate };
        }
        return c;
      });
      console.log(temp);
      return temp;
    });
  }, [startDate, endDate]);

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center">
      <div
        className="min-h-1/2 w-full m-4 p-6  md:m-0 md:w-1/2 bg-white rounded-2xl shadow-2xl flex flex-col gap-4"
        ref={popupRef}
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
            <div onClick={() => setEditDesc(true)}>
              <Edit className="text-gray-500 rounded-full h-4 w-4 translate-y-0.5 opacity-0 group-hover:opacity-100" />
            </div>
          </h5>
          {editDesc ? (
            <div className="ml-8">
              <Textarea
                ref={descRef}
                value={desc}
                onChange={(e) => {
                  setDesc(e.target.value);
                }}
              />
            </div>
          ) : (
            <div className="ml-8 break-words">{desc}</div>
          )}
        </div>
        <div className="flex gap-2">
          <Clock className="text-gray-500" />
          <div className="grid grid-cols-2 w-full gap-4">
            <div className="flex flex-col gap-2">
              <h6 className="font-semibold">Start Date</h6>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                ref={startDateRef}
              />
            </div>
            <div className="flex flex-col gap-2">
              <h6 className="font-semibold">Due Date</h6>
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                ref={endDateRef}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
