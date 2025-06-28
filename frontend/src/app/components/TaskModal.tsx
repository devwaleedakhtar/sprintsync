import { useState } from "react";
import { useSession } from "next-auth/react";
import api from "@/app/lib/api";
import { useForm } from "react-hook-form";
import type { UserProfile } from "@/auth";
import {
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { Task } from "./TaskItem";

const statusOptions = ["Todo", "In Progress", "Done"];

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
}

export default function TaskModal({
  task,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}: TaskModalProps) {
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
  } = useForm<Omit<Task, "id" | "created_at" | "updated_at">>({
    defaultValues: {
      title: task.title,
      description: task.description,
      total_minutes: task.total_minutes || 0,
      status: task.status,
    },
  });

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await api.delete(`/tasks/${task.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      onTaskDeleted();
      onClose();
    } catch {
      setError("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: {
    title: string;
    description: string;
    total_minutes?: number;
    status: string;
  }) => {
    setLoading(true);
    setError("");
    try {
      await api.put(
        `/tasks/${task.id}`,
        { ...task, ...data },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setEditing(false);
      onTaskUpdated();
      onClose();
    } catch {
      setError("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full transition"
          onClick={onClose}
          aria-label="Close"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                {...register("title", { required: "Title is required." })}
                className="w-full px-3 py-2 border rounded"
                placeholder="Title"
              />
              {errors.title && (
                <span className="text-red-500 text-xs">
                  {errors.title.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required.",
                })}
                className="w-full px-3 py-2 border rounded min-h-[80px]"
                placeholder="Description"
              />
              {errors.description && (
                <span className="text-red-500 text-xs">
                  {errors.description.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Estimated Minutes
              </label>
              <input
                type="number"
                min={1}
                {...register("total_minutes", {
                  required: "Estimated minutes is required.",
                  min: { value: 1, message: "Must be at least 1 minute." },
                })}
                className="w-full px-3 py-2 border rounded"
                placeholder="Estimated Minutes"
              />
              {errors.total_minutes && (
                <span className="text-red-500 text-xs">
                  {errors.total_minutes.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                {...register("status", { required: true })}
                className="w-full px-3 py-2 border rounded"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={loading}
              >
                Save
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded"
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
            <h2 className="text-xl font-bold mb-2">{task.title}</h2>
            <div className="mb-2">
              <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 border border-blue-200 mr-2">
                {task.status}
              </span>
              {task.total_minutes !== undefined && (
                <span className="inline-block text-xs text-gray-500">
                  ⏱ {task.total_minutes} min
                </span>
              )}
            </div>
            <div className="mb-4 whitespace-pre-line text-gray-700 text-sm">
              {task.description}
            </div>
            <div className="text-xs text-gray-400 mb-4">
              Created: {new Date(task.created_at).toLocaleString()}
              <br />
              Updated: {new Date(task.updated_at).toLocaleString()}
            </div>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded transition focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
                onClick={() => setEditing(true)}
                disabled={loading}
                aria-label="Edit Task"
              >
                <PencilSquareIcon className="w-5 h-5" />
                <span>Edit</span>
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 text-red-500 hover:bg-red-50 hover:border-red-400 rounded transition focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-60"
                onClick={handleDelete}
                disabled={loading}
                aria-label="Delete Task"
              >
                <TrashIcon className="w-5 h-5" />
                <span>Delete</span>
              </button>
            </div>
            {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
}
