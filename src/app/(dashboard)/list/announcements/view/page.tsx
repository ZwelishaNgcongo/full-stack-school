// app/list/announcements/view/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";

interface AnnouncementWithClass {
  id: number;
  title: string;
  description: string;
  date: Date;
  classId: number | null;
  createdAt: Date;
  updatedAt: Date;
  class: { id: number; name: string } | null;
}

async function getAnnouncements(): Promise<AnnouncementWithClass[]> {
  return await prisma.announcement.findMany({
    include: {
      class: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });
}

const AnnouncementViewPage = async () => {
  const announcements = await getAnnouncements();
  const today = new Date();

  // Categorize announcements
  const todayAnnouncements = announcements.filter(a => 
    new Date(a.date).toDateString() === today.toDateString()
  );
  
  const upcomingAnnouncements = announcements.filter(a => 
    new Date(a.date) > today
  );
  
  const pastAnnouncements = announcements.filter(a => 
    new Date(a.date) < today && new Date(a.date).toDateString() !== today.toDateString()
  );

  const renderAnnouncementCard = (announcement: AnnouncementWithClass) => {
    const announcementDate = new Date(announcement.date);
    const isToday = announcementDate.toDateString() === today.toDateString();
    const isPast = announcementDate < today && !isToday;
    const isUpcoming = announcementDate > today;

    return (
      <div
        key={announcement.id}
        className={`rounded-xl p-6 border-2 transition-all duration-300 ${
          isToday
            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300 hover:shadow-lg"
            : isPast
            ? "bg-gray-50 border-gray-200"
            : "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:border-purple-300 hover:shadow-lg"
        }`}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            {/* Status Badge */}
            <div className="mb-3">
              {isToday ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold animate-pulse">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Today
                </span>
              ) : isPast ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Past
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-200 text-blue-700 rounded-full text-xs font-semibold">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                  </svg>
                  Upcoming
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-800 mb-3">{announcement.title}</h3>

            {/* Class Badge */}
            <div className="mb-3">
              {announcement.class ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold text-xs shadow-md">
                  📚 {announcement.class.name}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold text-xs shadow-md">
                  🏫 All School
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
              {announcement.description}
            </p>

            {/* Date */}
            <div className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-lg border border-gray-200 w-fit">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-xs">
                <div className="text-gray-500">Date</div>
                <div className="font-semibold text-gray-700">
                  {announcementDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>
          </div>

          {/* View Details Button */}
          <Link
            href={`/list/announcements/view/${announcement.id}`}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/list/announcements"
              className="w-10 h-10 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl blur-md opacity-50"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                All Announcements
              </h1>
              <p className="text-gray-600 mt-1">
                {announcements.length} Announcement{announcements.length !== 1 ? "s" : ""} Total
              </p>
            </div>
          </div>
        </div>

        {/* Today's Announcements */}
        {todayAnnouncements.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-green-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Today Announcements</h2>
                  <p className="text-sm text-gray-500">{todayAnnouncements.length} announcement{todayAnnouncements.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="space-y-4">
                {todayAnnouncements.map(renderAnnouncementCard)}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Announcements */}
        {upcomingAnnouncements.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Upcoming Announcements</h2>
                  <p className="text-sm text-gray-500">{upcomingAnnouncements.length} announcement{upcomingAnnouncements.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="space-y-4">
                {upcomingAnnouncements.map(renderAnnouncementCard)}
              </div>
            </div>
          </div>
        )}

        {/* Past Announcements */}
        {pastAnnouncements.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Past Announcements</h2>
                  <p className="text-sm text-gray-500">{pastAnnouncements.length} announcement{pastAnnouncements.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="space-y-4">
                {pastAnnouncements.map(renderAnnouncementCard)}
              </div>
            </div>
          </div>
        )}

        {/* No Announcements */}
        {announcements.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-12">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <p className="text-xl font-semibold text-gray-400">No announcements available</p>
              <p className="text-gray-500 mt-2">Check back later for updates</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementViewPage;