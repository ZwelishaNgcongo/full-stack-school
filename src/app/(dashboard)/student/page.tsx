"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import AnnouncementWidget from "@/components/AnnouncementWidget";

export default function StudentPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!user) return <div className="p-4">No user found.</div>;

  const classIdNum = user.classId ? Number(user.classId) : 1;

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule</h1>
          <BigCalendarContainer type="classId" id={classIdNum} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <AnnouncementWidget />
      </div>
    </div>
  );
}
