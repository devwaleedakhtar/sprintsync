"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import api from "@/app/lib/api";
import { useForm } from "react-hook-form";
import type { UserProfile } from "@/auth";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

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

const statusOptions = ["Todo", "In Progress", "Done"];

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
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | string[]>("");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Omit<Task, "id" | "created_at" | "updated_at" | "status">>({
    defaultValues: {
      title: task.title,
      description: task.description,
      total_minutes: task.total_minutes || 0,
    },
  });

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await api.delete(`${backendUrl}/tasks/${task.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      onTaskDeleted();
    } catch {
      setError("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLoading(true);
    setError("");
    try {
      await api.put(
        `${backendUrl}/tasks/${task.id}`,
        { ...task, status: e.target.value },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      onTaskUpdated();
    } catch {
      setError("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: {
    title: string;
    description: string;
    total_minutes?: number;
  }) => {
    setLoading(true);
    setError("");
    try {
      await api.put(
        `${backendUrl}/tasks/${task.id}`,
        { ...task, ...data },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setEditing(false);
      onTaskUpdated();
    } catch {
      setError("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="p-4 bg-white rounded shadow border border-gray-200 mb-2">
      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div>
            <input
              {...register("title", { required: "Title is required." })}
              className="w-full px-2 py-1 border rounded"
              placeholder="Title"
            />
            {errors.title && (
              <span className="text-red-500 text-xs">
                {errors.title.message}
              </span>
            )}
          </div>
          <div>
            <textarea
              {...register("description", {
                required: "Description is required.",
              })}
              className="w-full px-2 py-1 border rounded"
              placeholder="Description"
            />
            {errors.description && (
              <span className="text-red-500 text-xs">
                {errors.description.message}
              </span>
            )}
          </div>
          <div>
            <input
              type="number"
              min={1}
              {...register("total_minutes", {
                required: "Estimated minutes is required.",
                min: { value: 1, message: "Must be at least 1 minute." },
              })}
              className="w-full px-2 py-1 border rounded"
              placeholder="Estimated Minutes"
            />
            {errors.total_minutes && (
              <span className="text-red-500 text-xs">
                {errors.total_minutes.message}
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded"
              disabled={loading}
            >
              Save
            </button>
            <button
              type="button"
              className="px-3 py-1 bg-gray-300 rounded"
              onClick={() => {
                setEditing(false);
                reset();
              }}
            >
              Cancel
            </button>
          </div>
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
        </form>
      ) : (
        <>
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-lg">{task.title}</span>
            <select
              value={task.status}
              onChange={handleStatusChange}
              className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 border border-blue-200"
              disabled={loading}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="text-gray-700 text-sm mb-1">{task.description}</div>
          {task.total_minutes !== undefined && (
            <div className="text-xs text-gray-500">
              Estimated: {task.total_minutes} min
            </div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            Created: {new Date(task.created_at).toLocaleString()}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded transition focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
              onClick={() => setEditing(true)}
              disabled={loading}
              aria-label="Edit Task"
            >
              <PencilSquareIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 text-red-500 hover:bg-red-50 hover:border-red-400 rounded transition focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-60"
              onClick={handleDelete}
              disabled={loading}
              aria-label="Delete Task"
            >
              <TrashIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
        </>
      )}
    </li>
  );
}
