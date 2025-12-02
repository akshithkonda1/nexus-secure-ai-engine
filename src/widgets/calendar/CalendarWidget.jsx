import React, { useEffect, useMemo, useState } from "react";
import { CalendarStore, exportCalendarData, syncCalendarToCloud } from "./CalendarStore";
import CalendarEventModal from "./CalendarEventModal";
import { getEventColor } from "../../utils/colors";

const views = ["month", "week", "day"];

function formatDateKey(date) {
  return date.toISOString().split("T")[0];
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

const CalendarWidget = () => {
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [modalInfo, setModalInfo] = useState({ open: false, date: null, event: null });
  const [view, setView] = useState("month");
  const [events, setEvents] = useState(CalendarStore.getAll().events);

  useEffect(() => {
    setEvents(CalendarStore.getAll().events);
  }, []);

  const eventsByDay = useMemo(() => {
    return events.reduce((acc, evt) => {
      acc[evt.date] = acc[evt.date] ? [...acc[evt.date], evt] : [evt];
      return acc;
    }, {});
  }, [events]);

  const daysInMonth = useMemo(() => {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const days = [];
    const offset = start.getDay();
    for (let i = 0; i < offset; i += 1) {
      days.push(null);
    }
    for (let day = 1; day <= end.getDate(); day += 1) {
      days.push(new Date(year, month, day));
    }
    return days;
  }, [referenceDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(referenceDate);
    return new Array(7).fill(null).map((_, idx) => {
      const d = new Date(start);
      d.setDate(start.getDate() + idx);
      return d;
    });
  }, [referenceDate]);

  const dayEvents = useMemo(() => {
    return CalendarStore.getEventsForDay(formatDateKey(referenceDate));
  }, [referenceDate, events]);

  const handleAddEvent = (payload) => {
    CalendarStore.addEvent(payload);
    setEvents(CalendarStore.getAll().events);
    setModalInfo({ open: false });
  };

  const handleEditEvent = (payload) => {
    CalendarStore.editEvent(payload.id, payload);
    setEvents(CalendarStore.getAll().events);
    setModalInfo({ open: false });
  };

  const handleDeleteEvent = (id) => {
    CalendarStore.deleteEvent(id);
    setEvents(CalendarStore.getAll().events);
    setModalInfo({ open: false });
  };

  const handleSave = (payload) => {
    if (payload.id) {
      handleEditEvent(payload);
    } else {
      handleAddEvent(payload);
    }
  };

  const handleSync = async () => {
    const payload = exportCalendarData();
    await syncCalendarToCloud(payload);
  };

  const renderDayCell = (date, idx) => {
    const key = date ? formatDateKey(date) : `empty-${idx}`;
    const todaysKey = formatDateKey(new Date());
    const isToday = date && formatDateKey(date) === todaysKey;
    const markers = date ? eventsByDay[formatDateKey(date)] || [] : [];

    return (
      <button
        key={key}
        onClick={() => (date ? setModalInfo({ open: true, date: formatDateKey(date), event: null }) : null)}
        className={`relative flex h-16 flex-col items-center justify-center rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] transition ${
          isToday ? "ring-2 ring-[var(--btn-bg)]" : ""
        }`}
      >
        {date ? (
          <>
            <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--text-primary)]">
              {date.getDate()}
            </span>
            <div className="flex items-center gap-1">
              {markers.slice(0, 3).map((evt) => (
                <span
                  key={evt.id}
                  className="h-2 w-2 rounded-full"
                  style={{ background: getEventColor(evt.type) }}
                  title={evt.title}
                />
              ))}
            </div>
          </>
        ) : null}
      </button>
    );
  };

  return (
    <div className="ryuzen-card flex h-full w-full flex-col rounded-3xl border border-[var(--border-card)] bg-[var(--bg-widget)] p-4 text-[var(--text-primary)] shadow-xl backdrop-blur-[var(--glass-blur)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Calendar Widget</p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Schedule overview</h2>
          <p className="text-sm text-[var(--text-secondary)]">Tap any day to see details</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] px-2 py-1 text-xs text-[var(--text-secondary)]">
            <span className="px-2 text-[var(--text-primary)]">{referenceDate.toLocaleString("default", { month: "long" })}</span>
            <span className="rounded-full bg-[var(--bg-widget)] px-2 py-1 text-[var(--text-secondary)]">{referenceDate.getFullYear()}</span>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-1">
            {views.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  view === v ? "bg-[var(--btn-bg)] text-[var(--btn-text)]" : "text-[var(--text-secondary)] hover:bg-white/10"
                }`}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => setReferenceDate(new Date(referenceDate.setMonth(referenceDate.getMonth() - 1)))}
            className="rounded-xl border border-[var(--border-card)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/10"
          >
            ←
          </button>
          <button
            onClick={() => setReferenceDate(new Date(referenceDate.setMonth(referenceDate.getMonth() + 1)))}
            className="rounded-xl border border-[var(--border-card)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/10"
          >
            →
          </button>
          <button
            onClick={handleSync}
            className="rounded-xl bg-[var(--btn-bg)] px-3 py-2 text-sm font-semibold text-[var(--btn-text)] shadow"
          >
            Sync
          </button>
        </div>
      </div>

      {view === "month" ? (
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
            <div
              key={label}
              className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]"
            >
              {label}
            </div>
          ))}
          {daysInMonth.map((day, idx) => renderDayCell(day, idx))}
        </div>
      ) : null}

      {view === "week" ? (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, idx) => renderDayCell(day, idx))}
        </div>
      ) : null}

      {view === "day" ? (
        <div className="mt-2 space-y-2 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{referenceDate.toDateString()}</h3>
              <p className="text-xs text-[var(--text-secondary)]">Tap + to add an event</p>
            </div>
            <button
              onClick={() => setModalInfo({ open: true, date: formatDateKey(referenceDate), event: null })}
              className="rounded-lg bg-[var(--btn-bg)] px-3 py-2 text-xs font-semibold text-[var(--btn-text)]"
            >
              + Event
            </button>
          </div>
          <div className="space-y-2">
            {dayEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border-card)] bg-[var(--bg-widget)] p-4 text-[var(--text-secondary)]">
                No events scheduled.
              </div>
            ) : null}
            {dayEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between rounded-xl border border-[var(--border-card)] bg-[var(--bg-widget)] p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: getEventColor(evt.type) }} />
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{evt.title}</p>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{evt.time || "All day"}</p>
                  {evt.notes ? <p className="text-xs text-[var(--text-secondary)]">{evt.notes}</p> : null}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalInfo({ open: true, date: evt.date, event: evt })}
                    className="rounded-lg border border-[var(--border-card)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(evt.id)}
                    className="rounded-lg border border-[var(--border-card)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-white/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <CalendarEventModal
        open={modalInfo.open}
        date={modalInfo.date || formatDateKey(referenceDate)}
        event={modalInfo.event}
        onClose={() => setModalInfo({ open: false, event: null, date: null })}
        onSave={handleSave}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default CalendarWidget;
