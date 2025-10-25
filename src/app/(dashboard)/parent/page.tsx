"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import AnnouncementWidget from "@/components/AnnouncementWidget";

interface ParentStudent {
  id: number | string;
  name: string;
  surname: string;
  classId: number;
}

export default function ParentPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<ParentStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (user.role !== "parent") {
      setErr("Only parent accounts can access this page.");
      setLoading(false);
      return;
    }

    const parentId = user.parentId ?? user.id;

    const fetchStudents = async () => {
      try {
        const res = await fetch(`/api/parent/students?parentId=${parentId}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setStudents(data.students || []);
      } catch (e: any) {
        console.error("ParentPage fetch error:", e);
        setErr("Failed to load students.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  if (!user) {
    return <div className="p-4">Please sign in.</div>;
  }

  if (loading) {
    return <div className="p-4">Loading your students...</div>;
  }

  if (err) {
    return <div className="p-4 text-red-500">{err}</div>;
  }

  if (students.length === 0) {
    return (
      <div className="p-4">
        No students found for this parent account.
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {students.map((student) => (
          <div className="mb-4" key={student.id}>
            <div className="h-full bg-white p-4 rounded-md">
              <h1 className="text-xl font-semibold">
                Schedule ({student.name} {student.surname})
              </h1>
              <BigCalendarContainer type="classId" id={student.classId} />
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <AnnouncementWidget />
      </div>
    </div>
  );
}