import prisma from "@/lib/prisma";
import Link from "next/link";
import { Prisma } from "@prisma/client";

// Mock auth
async function getCurrentUser(): Promise<{ role: "admin" | "teacher" | "student" | "parent" | null; id?: string }> {
  return { role: "admin", id: "mock-user-id" };
}

// Use Prisma-generated type that matches your actual query
type LessonWithDetails = Prisma.LessonGetPayload<{
  include: {
    subject: { select: { name: true } };
    class: { select: { name: true; gradeId: true } };
    teacher: { select: { name: true; surname: true } };
  };
}>;

async function getLessonsByClass(classId?: number, day?: string): Promise<LessonWithDetails[]> {
  try {
    const whereClause: any = {};
    
    if (classId) {
      whereClause.classId = classId;
    }
    
    if (day) {
      whereClause.day = day;
    }

    const lessons = await prisma.lesson.findMany({
      where: whereClause,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true, gradeId: true } },
        teacher: { select: { name: true, surname: true } },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    console.log(`Found ${lessons.length} lessons for classId: ${classId}, day: ${day}`);
    return lessons;
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return [];
  }
}

async function getClasses() {
  try {
    return await prisma.class.findMany({
      include: {
        grade: { select: { level: true } },
      },
      orderBy: [
        { gradeId: "asc" },
        { name: "asc" },
      ],
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

// Subject color mapping
const subjectColors: Record<string, string> = {
  Mathematics: "from-blue-400 to-blue-600",
  English: "from-green-400 to-green-600",
  Physics: "from-purple-400 to-purple-600",
  Chemistry: "from-pink-400 to-pink-600",
  Biology: "from-teal-400 to-teal-600",
  History: "from-orange-400 to-orange-600",
  Geography: "from-yellow-400 to-yellow-600",
  Computer: "from-indigo-400 to-indigo-600",
  Art: "from-rose-400 to-rose-600",
  Music: "from-cyan-400 to-cyan-600",
};

const getSubjectColor = (subject: string) => {
  return subjectColors[subject] || "from-gray-400 to-gray-600";
};

const dayEmojis: Record<string, string> = {
  MONDAY: "🌟",
  TUESDAY: "🔥",
  WEDNESDAY: "💫",
  THURSDAY: "⚡",
  FRIDAY: "🎯",
};

// Format DateTime to time string
const formatTime = (dateTime: Date) => {
  const date = new Date(dateTime);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHour}:${displayMinutes} ${ampm}`;
};

// Calculate duration between two DateTimes
const calculateDuration = (startTime: Date, endTime: Date) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = Math.round(durationMs / (1000 * 60));
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return { hours, minutes, total: durationMinutes };
};

interface LessonTimetablePageProps {
  searchParams: { classId?: string; day?: string };
}

const LessonTimetablePage = async ({ searchParams }: LessonTimetablePageProps) => {
  const { role } = await getCurrentUser();
  const selectedClassId = searchParams.classId ? parseInt(searchParams.classId) : undefined;
  const selectedDay = searchParams.day || "MONDAY";
  
  const [lessons, classes] = await Promise.all([
    getLessonsByClass(selectedClassId, selectedDay),
    getClasses(),
  ]);

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6">
      {/* Animated background decoration */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-400 to-purple-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative">
        {/* Back Button */}
        <Link 
          href="/list/lessons"
          className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Lessons
        </Link>

        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-6 border-2 border-purple-100">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl blur-md opacity-50"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Lesson Timetable
                </h1>
                <p className="text-gray-600 mt-1">
                  {selectedClass 
                    ? `${selectedClass.name} • ${dayEmojis[selectedDay]} ${selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()}`
                    : "Select a class to view timetable"}
                </p>
              </div>
            </div>

            {/* Filters */}
            <form action="/list/lessons/timetable" method="get" className="flex flex-col md:flex-row gap-4">
              {/* Class Selector */}
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Select Class</label>
                <select
                  name="classId"
                  defaultValue={selectedClassId || ""}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="">Choose a class</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name} (Grade {classItem.grade.level === 0 ? "R" : classItem.grade.level})
                    </option>
                  ))}
                </select>
              </div>

              {/* Day Selector */}
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Select Day</label>
                <select
                  name="day"
                  defaultValue={selectedDay}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all cursor-pointer font-medium"
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {dayEmojis[day]} {day.charAt(0) + day.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  View Timetable
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Day Navigation Tabs */}
        {selectedClassId && (
          <div className="bg-white rounded-3xl shadow-xl p-4 mb-6 border-2 border-purple-100">
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <Link
                  key={day}
                  href={`/list/lessons/timetable?classId=${selectedClassId}&day=${day}`}
                  className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-semibold transition-all duration-300 text-center ${
                    selectedDay === day
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                  }`}
                >
                  <div className="text-lg">{dayEmojis[day]}</div>
                  <div className="text-sm">{day.slice(0, 3)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Timetable Content */}
        {!selectedClassId ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-purple-100">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Select a Class</h3>
                <p className="text-gray-600">
                  Choose a class from the dropdown above to view their lesson timetable
                </p>
              </div>
            </div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-purple-100">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Lessons Scheduled</h3>
                <p className="text-gray-600">
                  No lessons found for {selectedClass?.name} on {selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Make sure lessons are created with the correct class and day in the system
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-purple-100">
            {/* Day Header */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">{dayEmojis[selectedDay]}</span>
                {selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()} - {selectedClass?.name}
                <span className="ml-auto text-sm font-normal">
                  {lessons.length} Lesson{lessons.length !== 1 ? "s" : ""}
                </span>
              </h2>
            </div>

            {/* Lessons Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Subject</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Lesson Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Teacher</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson, index) => {
                    const { hours, minutes } = calculateDuration(lesson.startTime, lesson.endTime);
                    
                    return (
                      <tr
                        key={lesson.id}
                        className={`border-t border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-semibold text-gray-900">
                                {formatTime(lesson.startTime)}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 ml-7">
                              to {formatTime(lesson.endTime)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r ${getSubjectColor(lesson.subject.name)} text-white font-semibold text-sm shadow-md`}>
                            {lesson.subject.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900 font-medium">{lesson.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">
                                {lesson.teacher.name[0]}{lesson.teacher.surname[0]}
                              </span>
                            </div>
                            <span className="text-gray-700 font-medium">
                              {lesson.teacher.name} {lesson.teacher.surname}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 font-medium">
                            {hours > 0 && `${hours}h `}{minutes}min
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonTimetablePage;