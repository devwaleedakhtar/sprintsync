"use client";
import React from "react";
import { useSession } from "next-auth/react";
import Logout from "./Logout";

const Navigation = () => {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
      <div className="text-xl font-bold tracking-tight text-blue-700">
        SprintSync
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-gray-700 text-sm">{user.email}</span>
            <Logout />
          </>
        ) : null}
      </div>
    </nav>
  );
};

export default Navigation;
