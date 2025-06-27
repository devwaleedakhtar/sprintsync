"use client";

import { signOut } from "next-auth/react";
import React from "react";

const Logout = () => {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
    >
      Logout
    </button>
  );
};

export default Logout;
