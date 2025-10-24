// app/list/events/view/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";

interface GradeWithCount {
  id: number;
  level: number;
  _count: {
    Event: number;

  };
}

interface EventWithGrade {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  description: string | null;
  grade: { level: number } | null;
}

async function getGrades(): Promise<GradeWithCount[]> {
  return await prisma.grade.findMany({
    select: {
      id: true,
      level: true,
      _count: {
        select: {
          Event: true, // ✅ must match the relation name in the schema
        },
      },
    },
    orderBy: { level: "asc" },
  });
}


async function getGradeEvents(gradeId?: number): Promise<EventWithGrade[]> {
  const where = gradeId
    ? {
        OR: [
          { gradeId: gradeId },
          { gradeId: null },
        ],
      }
    : {};

  const events = await prisma.event.findMany({
    where,
    include: {
      grade: {
        select: {
          level: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return events as unknown as EventWithGrade[];
}

interface EventViewPageProps {
  searchParams: { gradeId?: string };
}

const EventViewPage = async ({ searchParams }: EventViewPageProps) => {
  const gradeId = searchParams.gradeId ? parseInt(searchParams.gradeId) : undefined;
  const grades = await getGrades();
  const events = await getGradeEvents(gradeId);
  const selectedGrade = gradeId ? grades.find((g) => g.id === gradeId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/list/events"
              className="w-10 h-10 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl blur-md opacity-50"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                {selectedGrade ? `Grade ${selectedGrade.level === 0 ? 'R' : selectedGrade.level} Events` : "All School Events"}
              </h1>
              <p className="text-gray-600 mt-1">
                {events.length} Event{events.length !== 1 ? "s" : ""} Scheduled
              </p>
            </div>
          </div>

          {/* Grade Filter */}
          {!gradeId && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                </svg>
                Select Grade to View Events
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {grades.map((grade) => (
                  <Link
                    key={grade.id}
                    href={`/list/events/view?gradeId=${grade.id}`}
                    className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">
                        {grade.level === 0 ? 'R' : grade.level}
                      </div>
                      <div className="text-xs text-white/90 font-medium">
                        Grade {grade.level === 0 ? 'R' : grade.level}
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs text-white font-semibold">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2- .9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
                        </svg>
                        {grade._count.Event}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Events Display */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-6">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2- .9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
              </svg>
              <p className="text-xl font-semibold text-gray-400">No events scheduled</p>
              <p className="text-gray-500 mt-2">There are no events scheduled {selectedGrade ? `for Grade ${selectedGrade.level === 0 ? 'R' : selectedGrade.level}` : ''} yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const startTime = new Date(event.startTime);
                const endTime = new Date(event.endTime);
                const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
                const hours = Math.floor(duration / 60);
                const minutes = duration % 60;
                const isUpcoming = startTime > new Date();
                const isPast = endTime < new Date();

                return (
                  <div
                    key={event.id}
                    className={`rounded-xl p-6 border-2 transition-all duration-300 ${isPast ? "bg-gray-50 border-gray-200" : isUpcoming ? "bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200 hover:border-orange-300 hover:shadow-lg" : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"}`}
                  >
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex-1 min-w-[300px]">

                        {/* Status Badge */}
                        <div className="mb-3">
                          {isPast ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16z"/>
                              </svg>
                              Completed
                            </span>
                          ) : isUpcoming ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-200 text-blue-700 rounded-full text-xs font-semibold">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                              </svg>
                              Upcoming
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-200 text-green-700 rounded-full text-xs font-semibold animate-pulse">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              In Progress
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-800 mb-3">{event.title}</h3>

                        {/* Grade Badge */}
                        <div className="mb-3">
                          {event.grade ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold text-xs shadow-md">
                              🎓 Grade {event.grade.level === 0 ? 'R' : event.grade.level}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold text-xs shadow-md">
                              🏫 All School
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {event.description && (
                          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        {/* Date / Time / Duration */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                          <div className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-lg border border-gray-200">
                            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="text-xs">
                              <div className="text-gray-500">Date</div>
                              <div className="font-semibold text-gray-700">
                                {startTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-lg border border-gray-200">
                            <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                            </svg>
                            <div className="text-xs">
                              <div className="text-gray-500">Time</div>
                              <div className="font-semibold text-gray-700">
                                {startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-lg border border-gray-200">
                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <div className="text-xs">
                              <div className="text-gray-500">Duration</div>
                              <div className="font-semibold text-gray-700">
                                {hours > 0 && `${hours}h `}{minutes}min
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div> // ✅ closes event card
                );
              })}
            </div> // ✅ closes space-y wrapper
          )}
        </div> {/* ✅ closes Events container */}

      </div>
    </div>
  );
};

export default EventViewPage;
