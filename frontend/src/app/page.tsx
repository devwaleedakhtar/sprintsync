import DailyReport from "./components/DailyReport";
import TasksList from "./components/TasksList";

export default function Home() {
  return (
    <div className="pb-20 pt-10 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-2 items-center sm:items-start">
        <DailyReport />
        <TasksList />
      </main>
    </div>
  );
}
