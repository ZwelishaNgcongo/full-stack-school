// app/list/events/view/[id]/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";

interface EventDetailPageProps {
  params: { id: string };
}

async function getEvent(id: number) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      grade: {
        select: {
          id: true,
          level: true,
        },
      },
    },
  });

  return event;
}

const EventDetailPage = async ({ params }: EventDetailPageProps) => {
  const eventId = parseInt(params.id);
  const event = await getEvent(eventId);

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-400">Event not found</h1>
          <Link href="/list/events" className="text-orange-600 hover:underline mt-4 inline-block">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const now = new Date();
  const isUpcoming = startTime > now;
  const isPast = endTime < now;

  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href={event.gradeId ? `/list/events/view?gradeId=${event.gradeId}` : "/list/events"}
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
                Event Details
              </h1>
              <p className="text-gray-600 mt-1">{event.title}</p>
            </div>
          </div>
        </div>

        {/* Event Card */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-3">{event.title}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  {event.grade ? (
                    <span className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold text-sm shadow-md">
                      🎓 Grade {event.grade.level === 0 ? 'R' : event.grade.level}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-purple-700 font-semibold text-sm shadow-md">
                      🏫 All School
                    </span>
                  )}
                  {isPast ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Completed
                    </span>
                  ) : isUpcoming ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-200 text-blue-800 rounded-lg text-sm font-semibold">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                      </svg>
                      Upcoming
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-200 text-green-800 rounded-lg text-sm font-semibold animate-pulse">
                      <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                {event.description && (
                  <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl p-5 border-2 border-orange-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                      Event Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>
                )}

                {/* Date/Time Details */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    Event Schedule
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Start Time */}
                    <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                      <div className="text-xs text-blue-600 font-semibold mb-2">START TIME</div>
                      <div className="font-bold text-gray-800 text-lg">
                        {startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mt-1">
                        {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </div>
                    </div>

                    {/* End Time */}
                    <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                      <div className="text-xs text-blue-600 font-semibold mb-2">END TIME</div>
                      <div className="font-bold text-gray-800 text-lg">
                        {endTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mt-1">
                        {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-blue-600 font-semibold">DURATION</div>
                        <div className="text-xl font-bold text-gray-800">
                          {hours > 0 && `${hours}h `}{minutes}min
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-100">
                  <div className="text-xs text-purple-600 font-semibold mb-1">EVENT ID</div>
                  <div className="font-mono text-sm text-gray-700 break-all">{event.id}</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-100">
                  <div className="text-xs text-green-600 font-semibold mb-1">CREATED</div>
                  <div className="text-sm font-medium text-gray-700">
                    {new Date(event.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(event.createdAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                {event.updatedAt && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-100">
                    <div className="text-xs text-amber-600 font-semibold mb-1">LAST UPDATED</div>
                    <div className="text-sm font-medium text-gray-700">
                      {new Date(event.updatedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(event.updatedAt).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex justify-end">
              <Link
                href={event.gradeId ? `/list/events/view?gradeId=${event.gradeId}` : "/list/events"}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                Back to Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;