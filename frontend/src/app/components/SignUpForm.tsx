"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "@/app/lib/api";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface SignUpInputs {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInputs>();
  const [error, setError] = useState<string | string[]>("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: SignUpInputs) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.post(`${backendUrl}/auth/register`, {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        password: data.password,
      });
      setSuccess("Registration successful! Redirecting to sign in...");
      setTimeout(() => router.push("/signin"), 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (
          err.response?.status === 422 &&
          Array.isArray(err.response.data.detail)
        ) {
          setError(err.response.data.detail.map((d: { msg: string }) => d.msg));
        } else if (err.response?.data?.detail) {
          setError(err.response.data.detail);
        } else {
          setError("A user with this email already exists");
        }
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-md mx-auto mt-10 p-8 bg-white rounded shadow"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
      {Array.isArray(error) ? (
        <ul className="text-red-500 text-sm mb-2">
          {error.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      ) : error ? (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      ) : null}
      {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email", {
            required: "Email is required.",
            pattern: { value: /.+@.+\..+/, message: "Invalid email address." },
          })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        {errors.email && (
          <span className="text-red-500 text-xs">{errors.email.message}</span>
        )}
      </div>
      <div>
        <label
          htmlFor="firstName"
          className="block text-sm font-medium text-gray-700"
        >
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          {...register("firstName", { required: "First name is required." })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        {errors.firstName && (
          <span className="text-red-500 text-xs">
            {errors.firstName.message}
          </span>
        )}
      </div>
      <div>
        <label
          htmlFor="lastName"
          className="block text-sm font-medium text-gray-700"
        >
          Last Name
        </label>
        <input
          id="lastName"
          type="text"
          {...register("lastName", { required: "Last name is required." })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        {errors.lastName && (
          <span className="text-red-500 text-xs">
            {errors.lastName.message}
          </span>
        )}
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register("password", { required: "Password is required." })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        {errors.password && (
          <span className="text-red-500 text-xs">
            {errors.password.message}
          </span>
        )}
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
      <div className="text-center mt-4">
        <Link href="/signin" className="text-blue-600 hover:underline text-sm">
          Already have an account? Sign in
        </Link>
      </div>
    </form>
  );
}
