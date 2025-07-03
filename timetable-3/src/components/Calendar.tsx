import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { v4 as uuidv4 } from "uuid";
import "../index.css";
import { useEffect } from "react";
import { useTimetable } from "@/hooks/useTimetable";

export default function Calendar() {
  const { slots, setSlots } = useTimetable();

  const getSlotColor = (type: string) => {
    if (type === "slot") return "#118ab2";
    else if (type === "buffer") return "#06d6a0";
    else if (type === "break") return "#ffd166";
    else if (type === "leave") return "red";
  };

  // const getEvents = (info) => {
  //   /**
  //    * generate a list of dates for which there are slots defined
  //    * for each date in the visible range (info.start, info.end),
  //    *     if there are events on that date, then push them
  //    *     else push the default events
  //    */

  //   const start = info.start;
  //   const end = info.end;
  //   const specificDates = getSpecificDates(slots);

  //   const generated = [];

  //   for (
  //     let date = new Date(start);
  //     date <= end;
  //     date.setDate(date.getDate() + 1)
  //   ) {
  //     const dateStr = format(date, "yyyy-MM-dd");

  //     if (specificDates.has(dateStr)) {
  //       const slotsToday = slots.filter(
  //         (s) => s.date === dateStr && s.type !== "no-events"
  //       );
  //       const eventList = slotsToday.map((slot) => {
  //         return {
  //           id: uuidv4(),
  //           title: slot.title,
  //           start: new Date(`${dateStr}T${slot.start}:00`),
  //           end: new Date(`${dateStr}T${slot.end}:00`),
  //           extendedProps: {
  //             description: slot.description,
  //             slotId: slot.id,
  //           },
  //           color: getSlotColor(slot.type),
  //         };
  //       });

  //       generated.push(...eventList);
  //     } else {
  //       const defaultSlots = slots.filter((slot) => slot.date === "default");
  //       const eventList = defaultSlots.map((slot) => {
  //         return {
  //           id: uuidv4(),
  //           title: slot.title,
  //           start: new Date(`${dateStr}T${slot.start}:00`),
  //           end: new Date(`${dateStr}T${slot.end}:00`),
  //           extendedProps: {
  //             description: slot.description,
  //             slotId: slot.id,
  //           },
  //           color: getSlotColor(slot.type),
  //         };
  //       });
  //       generated.push(...eventList);
  //     }
  //   }
  //   return generated;
  // };

  // adjust popover position if it goes out of the viewport
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const popoverEl = document.querySelector(".fc-popover");

      if (popoverEl) {
        const rect = popoverEl.getBoundingClientRect();

        if (rect.bottom > window.innerHeight) {
          const newTop = rect.top - rect.height - 10;
          popoverEl.style.top = `${newTop}px`;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  const handleEventClick = (info) => {
    info.jsEvent.stopPropagation();
  };

  // if two adjacent slots are buffer slots, merge them
  // if work slot overlaps with buffer/break, adjust buffer/break time
  useEffect(() => {
    /**
     * group by date
     * sort by start time
     * if two adjacent slots are buffer slots, merge them
     */

    const groupedSlots = slots.reduce((acc, slot) => {
      const date = slot.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
      return acc;
    }, {});

    const groupedSortedSlots = Object.entries(groupedSlots).reduce(
      (acc, [date, slots]) => {
        acc[date] = slots.sort((a, b) =>
          compareTime(a.start, "isBefore", b.start) ? -1 : 1
        );
        return acc;
      },
      {}
    );

    let isChangeSlots = false;

    for (let [date, sortedSlots] of Object.entries(groupedSortedSlots)) {
      for (let i = 0; i < sortedSlots.length - 1; i++) {
        // adjust buffer/break time
        if (
          compareTime(sortedSlots[i].end, "isAfter", sortedSlots[i + 1].start)
        ) {
          if (
            sortedSlots[i].type === "buffer" ||
            sortedSlots[i].type === "break"
          ) {
            sortedSlots[i].end = sortedSlots[i + 1].start;
            isChangeSlots = true;
          } else if (
            sortedSlots[i + 1].type === "buffer" ||
            sortedSlots[i + 1].type === "break"
          ) {
            if (sortedSlots[i + 1].end > sortedSlots[i].end) {
              sortedSlots[i + 1].start = sortedSlots[i].end;
            } else {
              sortedSlots = sortedSlots.filter((_, index) => index !== i + 1);
            }
            isChangeSlots = true;
          }
        }

        // merge two adjacent buffer slots
        if (
          sortedSlots[i].type === "buffer" &&
          sortedSlots[i + 1].type === "buffer" &&
          compareTime(sortedSlots[i].end, "isSame", sortedSlots[i + 1].start)
        ) {
          sortedSlots[i].end = sortedSlots[i + 1].end;
          sortedSlots.splice(i + 1, 1);
          isChangeSlots = true;
        }
      }
      groupedSortedSlots[date] = sortedSlots;
    }

    //
    for (let [date, sortedSlots] of Object.entries(groupedSortedSlots)) {
      for (let i = 0; i < sortedSlots.length; i++) {
        if (sortedSlots[i].type === "buffer") {
          for (let j = 0; j < sortedSlots.length; j++) {
            if (
              sortedSlots[j].start > sortedSlots[i].start &&
              sortedSlots[j].end < sortedSlots[i].end
            ) {
              sortedSlots.push({
                id: uuidv4(),
                date,
                start: sortedSlots[j].start,
                end: sortedSlots[j].end,
                type: "slot",
                title: "Work Slot",
                description: "",
              });
            }
          }
        }
      }
    }

    if (isChangeSlots) {
      const newSlots = Object.values(groupedSortedSlots).flat();
      setSlots(newSlots);
    }
  }, [slots]);

  return (
    <div>
      <div className="flex-1 p-8">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={(info, onSuccess) => {
            const events = slots; // getEvents(info);
            onSuccess(events);
          }}
          eventClick={handleEventClick}
          height={window.innerHeight - 120}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          views={{
            dayGridMonth: {
              dayMaxEventRows: 3,
            },
          }}
          nowIndicator={true}
          // discard extra cells
          fixedWeekCount={false}
          showNonCurrentDates={false}
          // in dayGridView, only show from 8am to 8pm with 15 min gap
          slotDuration="00:15:00"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
        />
      </div>
    </div>
  );
}
