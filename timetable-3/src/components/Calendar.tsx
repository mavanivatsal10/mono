import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { v4 as uuidv4 } from "uuid";
import "../index.css";
import { useEffect, useRef } from "react";
import { useTimetable } from "@/hooks/useTimetable";
import type {
  EventClickArg,
  EventInput,
  EventSourceFuncArg,
} from "@fullcalendar/core/index.js";
import { format } from "date-fns";
import { isOverlaping } from "@/lib/utils";
import EditEvent from "./EditEvent";
import { toast } from "sonner";

export default function Calendar() {
  const { slots, specificDates, editEvent, setEditEvent } = useTimetable();

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

        if (slots.length === 0) {
          continue;
        }

        // add buffer slots
        const generateBufferEvent = (start: string, end: string) => {
          return {
            id: uuidv4(),
            title: "Buffer",
            start: `${dateStr}T${start}:00`,
            end: `${dateStr}T${end}:00`,
            extendedProps: {
              description: "",
              type: "buffer",
            },
            color: getSlotColor("buffer"),
          };
        };

        const sortedDefaultSlots = slots
          .filter((s) => s.date === "default")
          .sort((a, b) => (a.start < b.start ? -1 : 1));

        if (sortedDefaultSlots.length === 0) {
          continue;
        }

        const dayStart = sortedDefaultSlots[0].start;
        const dayEnd = sortedDefaultSlots[sortedDefaultSlots.length - 1].end;
        const allEventsToday = generated.filter(
          (e) => format(e.start as Date, "yyyy-MM-dd") === dateStr
        );
        const sortedAllEventsToday = allEventsToday.sort((a, b) => {
          const astart = a.start as Date;
          const bstart = b.start as Date;
          return astart < bstart ? -1 : 1;
        });

        for (let i = 0; i < sortedAllEventsToday.length; i++) {
          const event = sortedAllEventsToday[i];
          const eventStart = format(event.start as Date, "HH:mm");
          const eventEnd = format(event.end as Date, "HH:mm");
          const nextEvent = sortedAllEventsToday[i + 1];
          if (nextEvent === undefined) {
            continue;
          }
          const nextEventStart = format(nextEvent.start as Date, "HH:mm");

          if (i === 0) {
            if (eventStart > dayStart && !specificDates.has(dateStr)) {
              generated.push(generateBufferEvent(dayStart, eventStart));
            }
            if (eventEnd < nextEventStart) {
              if (nextEvent.extendedProps?.type === "buffer") {
                nextEvent.start = `${dateStr}T${eventEnd}:00`;
              } else if (event.extendedProps?.type === "buffer") {
                event.end = `${dateStr}T${nextEventStart}:00`;
              } else {
                generated.push(generateBufferEvent(eventEnd, nextEventStart));
              }
            }
          } else if (
            i === sortedAllEventsToday.length - 1 &&
            eventEnd < dayEnd &&
            !specificDates.has(dateStr)
          ) {
            generated.push(generateBufferEvent(eventEnd, dayEnd));
          } else if (eventEnd < nextEventStart) {
            if (nextEvent.extendedProps?.type === "buffer") {
              nextEvent.start = `${dateStr}T${eventEnd}:00`;
            } else if (event.extendedProps?.type === "buffer") {
              event.end = `${dateStr}T${nextEventStart}:00`;
            } else {
              generated.push(generateBufferEvent(eventEnd, nextEventStart));
            }
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

    if (arg.event._def.extendedProps.type === "buffer") {
      toast("Cannot edit buffer slots");
      return;
    }

    setEditEvent({
      showOverlay: true,
      eventData: arg.event,
    });
  };

  // Re-fetch events when slots change
  const calendarRef = useRef<FullCalendar | null>(null);
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
          // slotMinTime="08:00:00"
          // slotMaxTime="20:00:00"
        />
      </div>
      {editEvent.showOverlay && <EditEvent />}
    </div>
  );
}
