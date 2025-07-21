// app/(dashboard)/student/page.tsx
"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";

export default function StudentPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!user) return <div className="p-4">No user found.</div>;

  const classIdNum = user.classId ? Number(user.classId) : 1;

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      <div className="w-full mb-4 p-2 bg-blue-100 rounded">
        <p><strong>Debug Info:</strong></p>
        <p>User: {user.name} ({user.email})</p>
        <p>Role: {user.role}</p>
        <p>Class ID: {classIdNum}</p>
      </div>

      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule</h1>
          <BigCalendarContainer type="classId" id={classIdNum} />
        </div>
      </div>

      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
}
