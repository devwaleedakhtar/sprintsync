"use client";
import { useSession } from "next-auth/react";
import api from "@/app/lib/api";
import { useEffect, useState, useCallback } from "react";
import type { UserProfile } from "@/auth";
import TaskForm from "./TaskForm";
import { Task } from "./TaskItem";
import KanbanBoard from "./KanbanBoard";
import { Tab } from "@headlessui/react";
import DailyReport from "./DailyReport";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface TasksListProps {
  onTaskChange: () => void;
}

export default function TasksList({ onTaskChange }: TasksListProps) {
  const { data: session } = useSession();
  const accessToken = (session?.user as UserProfile)?.accessToken;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fetchTasks = useCallback(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`${backendUrl}/tasks/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => setTasks(res.data))
      .catch((e) => console.log(e))
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <section className="w-full px-2 sm:px-4 mb-8">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex space-x-2 border-b mb-4">
          <Tab
            className={({ selected }) =>
              `px-4 py-2 text-lg font-semibold focus:outline-none border-b-2 transition ${
                selected
                  ? "border-blue-600 text-blue-700 bg-blue-50"
                  : "border-transparent text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            Your Tasks
          </Tab>
          <Tab
            className={({ selected }) =>
              `px-4 py-2 text-lg font-semibold focus:outline-none border-b-2 transition ${
                selected
                  ? "border-blue-600 text-blue-700 bg-blue-50"
                  : "border-transparent text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            Daily Planning
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <button
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => setShowModal(true)}
            >
              + New Task
            </button>
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full transition"
                    onClick={() => setShowModal(false)}
                    aria-label="Close"
                    tabIndex={0}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                  <TaskForm
                    onTaskCreated={() => {
                      setShowModal(false);
                      fetchTasks();
                      onTaskChange();
                    }}
                  />
                </div>
              </div>
            )}
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : tasks.length === 0 ? (
              <div className="text-gray-600">No tasks found.</div>
            ) : (
              <KanbanBoard
                tasks={tasks}
                onTaskUpdated={() => {
                  fetchTasks();
                  onTaskChange();
                }}
              />
            )}
          </Tab.Panel>
          <Tab.Panel>
            <DailyReport triggerRefresh={fetchTasks} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </section>
  );
}
