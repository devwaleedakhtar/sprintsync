"use client";
import DailyReport from "./components/DailyReport";
import TasksList from "./components/TasksList";
import { useCallback } from "react";

export default function Home() {
  const triggerAgendaRefresh = useCallback(() => {}, []);
  return (
    <div className="pb-20 pt-10 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-[1200px] mx-auto flex flex-col gap-2 items-center sm:items-start">
        <TasksList onTaskChange={triggerAgendaRefresh} />
      </main>
    </div>
  );
}
