// src/app/admin/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCasinoStore } from "@/store/useStore";

export default function AdminDashboard() {
  const { setIsLoading } = useCasinoStore();

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold casino-gradient-text mb-2">
          Admin Dashboard
        </h1>
        <p className="text-lg opacity-75">
          Monitor and manage your casino platform
        </p>
      </div>

      {/* Quick Actions */}
      <div className="casino-card p-6">
        <h2 className="text-2xl font-bold mb-6 casino-gradient-text">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/opinions/create"
            className="casino-button-secondary p-4 rounded-lg text-center hover:bg-opacity-20 transition duration-300"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-semibold">Create New Event</div>
            <div className="text-sm opacity-75 mt-1">
              Start a new prediction market
            </div>
          </Link>

          <Link
            href="/admin/opinions/edit"
            className="casino-button-secondary p-4 rounded-lg text-center hover:bg-opacity-20 transition duration-300"
          >
            <div className="text-2xl mb-2">✏️</div>
            <div className="font-semibold">Edit Events</div>
            <div className="text-sm opacity-75 mt-1">
              Modify existing events
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="casino-button-secondary p-4 rounded-lg text-center hover:bg-opacity-20 transition duration-300"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-semibold">Manage Users</div>
            <div className="text-sm opacity-75 mt-1">
              View and moderate users
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
    </div>
  );
}
