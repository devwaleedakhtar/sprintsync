"use client";
import DailyReport from "./components/DailyReport";
import TasksList from "./components/TasksList";
import { useState, useCallback } from "react";

export default function Home() {
  const [agendaRefreshKey, setAgendaRefreshKey] = useState(0);
  const triggerAgendaRefresh = useCallback(() => {
    setAgendaRefreshKey((k) => k + 1);
  }, []);
  return (
    <div className="pb-20 pt-10 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-2 items-center sm:items-start">
        <DailyReport
          refreshKey={agendaRefreshKey}
          triggerRefresh={triggerAgendaRefresh}
        />
        <TasksList onTaskChange={triggerAgendaRefresh} />
      </main>
    </div>
  );
}
