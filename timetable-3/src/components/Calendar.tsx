import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { v4 as uuidv4 } from "uuid";
import "../index.css";
import { useEffect, useRef } from "react";
import { useTimetable } from "@/hooks/useTimetable";
import type { slot } from "@/types/types";
import type {
  EventClickArg,
  EventInput,
  EventSourceFuncArg,
} from "@fullcalendar/core/index.js";
import { format } from "date-fns";
import { isOverlaping } from "@/lib/utils";

export default function Calendar() {
  const { slots, setSlots, specificDates } = useTimetable();

  const getSlotColor = (type: string) => {
    if (type === "slot") return "#118ab2";
    else if (type === "buffer") return "#06d6a0";
    else if (type === "break") return "#ffd166";
    else if (type === "leave") return "red";
  };

  const getEvents = (info: EventSourceFuncArg) => {
    /**
     * loop through visible dates on calendar
     *  - if the user has set a specific schedule on that date, then push them
     *  - else:
     *     - if there are slots available on that date, then push them
     *     - loop through default slots and push non-overlapping slots
     *     - go through the day and add buffers for empty time blocks
     */

    const start = info.start;
    const end = info.end;
    const generated: EventInput[] = [];

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dateStr = format(date, "yyyy-MM-dd");
      if (specificDates.has(dateStr)) {
        const allSlots = slots.filter((s) => s.date === dateStr);
        const events = allSlots.map((s) => ({
          id: uuidv4(),
          title: s.title,
          start: `${dateStr}T${s.start}:00`,
          end: `${dateStr}T${s.end}:00`,
          extendedProps: {
            description: s.description,
            type: s.type,
            slotId: s.id,
          },
          color: getSlotColor(s.type),
        }));
        generated.push(...events);
      } else {
        const slotsToday = slots.filter((s) => s.date === dateStr);
        const eventsToday = slotsToday.map((s) => ({
          id: uuidv4(),
          title: s.title,
          start: `${dateStr}T${s.start}:00`,
          end: `${dateStr}T${s.end}:00`,
          extendedProps: {
            description: s.description,
            type: s.type,
            slotId: s.id,
          },
          color: getSlotColor(s.type),
        }));
        generated.push(...eventsToday);
        const defaultSlots = slots.filter((s) => s.date === "default");

        for (const dslot of defaultSlots) {
          if (
            !slotsToday.some((s) =>
              isOverlaping(
                { start: s.start, end: s.end },
                { start: dslot.start, end: dslot.end }
              )
            )
          ) {
            const event = {
              id: uuidv4(),
              title: dslot.title,
              start: `${dateStr}T${dslot.start}:00`,
              end: `${dateStr}T${dslot.end}:00`,
              extendedProps: {
                description: dslot.description,
                type: dslot.type,
                slotId: dslot.id,
              },
              color: getSlotColor(dslot.type),
            };
            generated.push(event);
          }
        }
      }
    }
    return generated;
  };

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

  const handleEventClick = (arg: EventClickArg) => {
    arg.jsEvent.stopPropagation();
  };

  // if two adjacent slots are buffer slots, merge them
  // if work slot overlaps with buffer/break, adjust buffer/break time
  useEffect(() => {
    /**
     * group by date
     * sort by start time
     * if two adjacent slots are buffer slots, merge them
     */

    const groupedSlots = slots.reduce<Record<string, slot[]>>((acc, slot) => {
      const date = slot.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
      return acc;
    }, {});

    const groupedSortedSlots = Object.entries(groupedSlots).reduce<
      Record<string, slot[]>
    >((acc, [date, slots]) => {
      acc[date] = slots.sort((a, b) => (a.start < b.start ? -1 : 1));
      return acc;
    }, {});

    let isChangeSlots = false;

    for (let [date, sortedSlots] of Object.entries(groupedSortedSlots)) {
      for (let i = 0; i < sortedSlots.length - 1; i++) {
        // adjust buffer/break time
        if (sortedSlots[i].end > sortedSlots[i + 1].start) {
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
          sortedSlots[i].end === sortedSlots[i + 1].start
        ) {
          sortedSlots[i].end = sortedSlots[i + 1].end;
          sortedSlots.splice(i + 1, 1);
          isChangeSlots = true;
        }
      }
      groupedSortedSlots[date] = sortedSlots;
    }

    //
    for (const [date, sortedSlots] of Object.entries(groupedSortedSlots)) {
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

  // Re-fetch events when slots change
  const calendarRef = useRef(null);
  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current?.getApi().refetchEvents();
    }
  }, [slots]);

  return (
    <div>
      <div className="flex-1 p-8">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={(info, onSuccess) => {
            const events = getEvents(info);
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
