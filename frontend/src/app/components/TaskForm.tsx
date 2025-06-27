"use client";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import api from "@/app/lib/api";
import axios from "axios";
import { useState } from "react";
import type { UserProfile } from "@/auth";
import { SparklesIcon } from "@heroicons/react/24/outline";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface TaskFormInputs {
  title: string;
  description: string;
  total_minutes: number;
}

export default function TaskForm({
  onTaskCreated,
}: {
  onTaskCreated: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TaskFormInputs>();
  const { data: session } = useSession();
  const accessToken = (session?.user as UserProfile)?.accessToken;
  const [error, setError] = useState<string | string[]>("");
  const [loading, setLoading] = useState(false);
  const description = watch("description");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const onSubmit = async (data: TaskFormInputs) => {
    setError("");
    setLoading(true);
    try {
      await api.post(`${backendUrl}/tasks/`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      reset();
      onTaskCreated();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (Array.isArray(detail)) {
          setError(detail.map((d: { msg: string }) => d.msg));
        } else if (typeof detail === "string") {
          setError(detail);
        } else {
          setError("Failed to create task");
        }
      } else {
        setError("Failed to create task");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateDescription = async () => {
    setAiError("");
    setAiLoading(true);
    try {
      const title = (document.getElementById("title") as HTMLInputElement)
        ?.value;
      if (!title) {
        setAiError("Please enter a title first.");
        setAiLoading(false);
        return;
      }
      const response = await fetch(`${api.defaults.baseURL}/ai/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ title }),
      });
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      let result = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
        // Extract only the chunk after 'data: '
        const matches = result.match(/data: ([^\n]*)/g);
        let text = "";
        if (matches) {
          text = matches.map((m) => m.replace("data: ", "")).join("");
        }
        setValue("description", text, { shouldValidate: true });
      }
    } catch {
      setAiError("Failed to generate description");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-0 bg-transparent max-w-2xl mx-auto"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Create a New Task
        </h3>
        <div className="h-px bg-gray-200 w-full" />
      </div>
      {Array.isArray(error) ? (
        <ul className="text-red-500 text-sm mb-2">
          {error.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      ) : error ? (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      ) : null}
      <div className="mb-4">
        <label
          htmlFor="title"
          className="block text-base font-medium text-gray-700 mb-1"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          {...register("title", { required: "Title is required." })}
          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base transition"
        />
        {errors.title && (
          <span className="text-red-500 text-xs">{errors.title.message}</span>
        )}
      </div>
      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-base font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <div className="relative">
          <textarea
            id="description"
            {...register("description", {
              required: "Description is required.",
            })}
            value={description}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base transition min-h-[96px] resize-vertical pr-16"
            aria-describedby="generate-ai-desc"
          />
          <button
            type="button"
            className="absolute top-3 right-3 flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 transition text-sm font-semibold"
            onClick={generateDescription}
            disabled={aiLoading}
            aria-label="Generate description with AI"
            id="generate-ai-desc"
          >
            <SparklesIcon className="w-5 h-5 mr-1" />
            {aiLoading ? "Generating..." : "AI"}
          </button>
        </div>
        {aiError && <div className="text-red-500 text-xs mt-1">{aiError}</div>}
        {errors.description && (
          <span className="text-red-500 text-xs">
            {errors.description.message}
          </span>
        )}
      </div>
      <div className="mb-6">
        <label
          htmlFor="total_minutes"
          className="block text-base font-medium text-gray-700 mb-1"
        >
          Estimated Minutes
        </label>
        <input
          id="total_minutes"
          type="number"
          min={1}
          {...register("total_minutes", {
            required: "Estimated minutes is required.",
            min: { value: 1, message: "Must be at least 1 minute." },
          })}
          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base transition"
        />
        {errors.total_minutes && (
          <span className="text-red-500 text-xs">
            {errors.total_minutes.message}
          </span>
        )}
      </div>
      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg text-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
}
