import { auth } from "@/auth";
import type { UserProfile } from "@/auth";

export default async function Home() {
  const session = await auth();
  const user = session?.user as UserProfile | undefined;

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {user && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">
              Welcome, {user.first_name} {user.last_name}!
            </h2>
            <div className="text-sm text-gray-700">Email: {user.email}</div>
            <div className="text-xs text-gray-500 mt-1">User ID: {user.id}</div>
          </div>
        )}
      </main>
    </div>
  );
}
