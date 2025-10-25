// app/admin/page.tsx
import UserCard from "@/components/UserCard";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import Announcements from "@/components/Announcement";
import Image from "next/image";

// Mock function to get current user
async function getCurrentUser(): Promise<{ 
  role: "admin" | "teacher" | "student" | "parent" | null; 
  id?: string; 
  name?: string 
}> {
  return { role: "admin", id: "mock-user-id", name: "Zwelisha Ngcongo" };
}

interface DashboardPageProps {
  searchParams?: { [key: string]: string | undefined };
}

export default async function DashboardPage({ searchParams = {} }: DashboardPageProps) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl blur-md opacity-50"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Welcome back, {user?.name || "Admin"}!
              </h1>
              <p className="text-gray-500 mt-1">Here is what is happening with your school today</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-800">{user?.name || "Guest"}</span>
              <span className="text-xs text-gray-500 capitalize">{user?.role || "guest"}</span>
            </div>
            <Image
              src="/avatar.png"
              alt="User Avatar"
              width={48}
              height={48}
              className="rounded-full border-2 border-purple-200 shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="transform transition-all hover:scale-105 duration-300">
          <UserCard type="admin" />
        </div>
        <div className="transform transition-all hover:scale-105 duration-300">
          <UserCard type="student" />
        </div>
        <div className="transform transition-all hover:scale-105 duration-300">
          <UserCard type="teacher" />
        </div>
        <div className="transform transition-all hover:scale-105 duration-300">
          <UserCard type="parent" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Student Distribution Chart - Takes 1/3 on large screens */}
        <div className="xl:col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Student Distribution</h2>
          </div>
          <CountChartContainer />
        </div>

        {/* Event Calendar - Takes 2/3 on large screens */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Upcoming Events</h2>
          </div>
          <EventCalendarContainer searchParams={searchParams} />
        </div>
      </div>

      {/* Announcements - Full Width */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800">Recent Announcements</h2>
        </div>
        <Announcements />
      </div>
    </div>
  );
}