"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SignInInputs {
  email: string;
  password: string;
}

export default function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignInInputs>();
  const [error, setError] = useState<string | string[]>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: SignInInputs) => {
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
    }
  };

  const fillDemoCredentials = () => {
    setValue("email", "demo@example.com");
    setValue("password", "demopassword");
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      {/* Demo Credentials Section */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">
          Demo Credentials
        </h3>
        <div className="text-sm text-blue-700 mb-3">
          <p>
            <strong>Email:</strong> demo@example.com
          </p>
          <p>
            <strong>Password:</strong> demopassword
          </p>
        </div>
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
        >
          Use Demo Credentials
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 p-8 bg-white rounded shadow"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
        {Array.isArray(error) ? (
          <ul className="text-red-500 text-sm mb-2">
            {error.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : error ? (
          <div className="text-red-500 text-sm mb-2">{error}</div>
        ) : null}
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
              pattern: {
                value: /.+@.+\..+/,
                message: "Invalid email address.",
              },
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
          />
          {errors.email && (
            <span className="text-red-500 text-xs">{errors.email.message}</span>
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
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <div className="text-center mt-4">
          <Link
            href="/signup"
            className="text-blue-600 hover:underline text-sm"
          >
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
