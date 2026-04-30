import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [current, setCurrent] = useState(new Date());

  useEffect(() => {
    api.get("/tasks").then(({ data }) => setTasks(data)).catch(() => {});
    api.get("/reminders").then(({ data }) => setReminders(data)).catch(() => {});
  }, []);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = current.toLocaleString("default", { month: "long", year: "numeric" });

  const getItemsForDay = (day) => {
    const date = new Date(year, month, day);
    const dateStr = date.toDateString();
    const t = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === dateStr);
    const r = reminders.filter(r => new Date(r.remindAt).toDateString() === dateStr);
    return { tasks: t, reminders: r };
  };

  const isToday = (day) => new Date(year, month, day).toDateString() === new Date().toDateString();

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  const taskStatusColor = { Pending: "bg-yellow-400", "In Progress": "bg-blue-400", Done: "bg-green-400" };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Calendar</h2>
        <div className="flex items-center gap-3">
          <button onClick={prev} className="px-3 py-1 bg-white shadow rounded hover:bg-gray-50">‹</button>
          <span className="font-semibold text-lg">{monthName}</span>
          <button onClick={next} className="px-3 py-1 bg-white shadow rounded hover:bg-gray-50">›</button>
          <button onClick={() => setCurrent(new Date())} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Today</button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> Pending Task</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block" /> In Progress</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Done</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-400 inline-block" /> Reminder</span>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="p-3 text-center text-xs font-semibold text-gray-500">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24 p-2 border-b border-r bg-gray-50" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const { tasks: dayTasks, reminders: dayReminders } = getItemsForDay(day);
            const hasItems = dayTasks.length > 0 || dayReminders.length > 0;
            return (
              <div key={day} className={`min-h-24 p-2 border-b border-r ${isToday(day) ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                <span className={`text-sm font-medium inline-flex w-7 h-7 items-center justify-center rounded-full ${isToday(day) ? "bg-blue-600 text-white" : "text-gray-700"}`}>
                  {day}
                </span>
                <div className="mt-1 space-y-1">
                  {dayTasks.slice(0, 2).map(t => (
                    <div key={t._id} className={`text-xs px-1.5 py-0.5 rounded text-white truncate ${taskStatusColor[t.status] || "bg-gray-400"}`} title={t.title}>
                      {t.title}
                    </div>
                  ))}
                  {dayReminders.slice(0, 2).map(r => (
                    <div key={r._id} className="text-xs px-1.5 py-0.5 rounded bg-purple-400 text-white truncate" title={r.title}>
                      🔔 {r.title}
                    </div>
                  ))}
                  {(dayTasks.length + dayReminders.length) > 4 && (
                    <div className="text-xs text-gray-400">+{dayTasks.length + dayReminders.length - 4} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
