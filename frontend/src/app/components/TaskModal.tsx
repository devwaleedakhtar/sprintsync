import { useState } from "react";
import { useSession } from "next-auth/react";
import api from "@/app/lib/api";
import { useForm } from "react-hook-form";
import type { UserProfile } from "@/auth";
import {
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { Task } from "./TaskItem";
import ReactMarkdown from "react-markdown";

const statusOptions = ["Todo", "In Progress", "Done"];
const PRESET_MINUTES = [15, 30, 45, 60, 90, 120];

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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
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

  const totalMinutes = watch ? watch("total_minutes") : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in max-h-[70vh] overflow-auto">
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
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 transition text-sm font-semibold"
                  onClick={async () => {
                    setAiError("");
                    setAiLoading(true);
                    try {
                      const title = (
                        document.querySelector(
                          'input[name="title"]'
                        ) as HTMLInputElement
                      )?.value;
                      if (!title) {
                        setAiError("Please enter a title first.");
                        setAiLoading(false);
                        return;
                      }
                      const response = await fetch(
                        `${api.defaults.baseURL}/ai/suggest`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                          },
                          body: JSON.stringify({ title }),
                        }
                      );
                      if (!response.body) throw new Error("No response body");
                      const reader = response.body.getReader();
                      let buffer = "";
                      while (true) {
                        const { value, done } = await reader.read();
                        if (done) break;
                        const chunk = new TextDecoder().decode(value);
                        chunk.split("\n").forEach((line) => {
                          if (line.startsWith("data: ")) {
                            const b64 = line.replace("data: ", "");
                            if (b64.trim()) buffer += atob(b64);
                          }
                        });
                        // Set the markdown description
                        (
                          document.querySelector(
                            'textarea[name="description"]'
                          ) as HTMLTextAreaElement
                        ).value = buffer;
                        // Also update react-hook-form state
                        setValue("description", buffer, {
                          shouldValidate: true,
                        });
                      }
                    } catch {
                      setAiError("Failed to generate description");
                    } finally {
                      setAiLoading(false);
                    }
                  }}
                  disabled={aiLoading}
                  aria-label="Generate description with AI"
                >
                  <SparklesIcon className="w-5 h-5 mr-1" />
                  {aiLoading ? "Generating..." : "AI"}
                </button>
                {aiError && (
                  <div className="text-red-500 text-xs mt-1">{aiError}</div>
                )}
              </div>
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
              <div className="flex gap-2 mb-2 flex-wrap">
                {PRESET_MINUTES.map((min) => (
                  <button
                    type="button"
                    key={min}
                    className={`px-3 py-1 rounded border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      Number(totalMinutes) === min
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                    }`}
                    onClick={() =>
                      setValue("total_minutes", min, { shouldValidate: true })
                    }
                  >
                    {min < 60
                      ? `${min} min`
                      : `${min / 60} hr${min > 60 ? "s" : ""}`}
                  </button>
                ))}
              </div>
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
            <div className="mb-4 text-gray-700 text-sm prose prose-blue max-w-none">
              <div className="prose-sm max-w-none [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:mt-2 [&_h3]:mb-1">
                <ReactMarkdown>{task.description}</ReactMarkdown>
              </div>
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
