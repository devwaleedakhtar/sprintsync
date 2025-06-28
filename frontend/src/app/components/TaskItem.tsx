"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import api from "@/app/lib/api";
import { TrashIcon } from "@heroicons/react/24/outline";
import Modal from "./TaskModal";
import type { UserProfile } from "@/auth";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface Task {
  id: string;
  title: string;
  description: string;
  total_minutes?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function TaskItem({
  task,
  onTaskUpdated,
  onTaskDeleted,
}: {
  task: Task;
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
}) {
  const { data: session } = useSession();
  const accessToken = (session?.user as UserProfile)?.accessToken;
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    try {
      await api.delete(`${backendUrl}/tasks/${task.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      onTaskDeleted();
    } catch {
      // Handle error
    }
  };

  return (
    <>
      <div
        className="cursor-pointer p-4 bg-white rounded-xl shadow-md border border-gray-200 mb-2 hover:shadow-lg transition flex flex-col gap-2 min-h-[72px] relative group"
        onClick={() => setShowModal(true)}
        tabIndex={0}
        role="button"
        aria-label={`View details for task ${task.title}`}
      >
        <div className="flex items-center">
          <span className="font-semibold text-base break-words w-full">
            {task.title}
          </span>
        </div>
        {task.total_minutes !== undefined && (
          <div className="text-xs text-gray-500">
            ⏱ {task.total_minutes} min
          </div>
        )}
        <div className="text-xs text-gray-400 mt-1">
          Created: {new Date(task.created_at).toLocaleString()}
        </div>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          aria-label="Delete task"
          tabIndex={0}
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
      {showModal && (
        <Modal
          task={task}
          onClose={() => setShowModal(false)}
          onTaskUpdated={onTaskUpdated}
          onTaskDeleted={onTaskDeleted}
        />
      )}
    </>
  );
}
