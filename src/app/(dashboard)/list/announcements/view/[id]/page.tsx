// app/list/announcements/view/[id]/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";

interface AnnouncementDetailPageProps {
  params: { id: string };
}

async function getAnnouncement(id: number) {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: {
      class: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return announcement;
}

const AnnouncementDetailPage = async ({ params }: AnnouncementDetailPageProps) => {
  const announcementId = parseInt(params.id);
  const announcement = await getAnnouncement(announcementId);

  if (!announcement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-400">Announcement not found</h1>
          <Link href="/list/announcements" className="text-purple-600 hover:underline mt-4 inline-block">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  const announcementDate = new Date(announcement.date);
  const today = new Date();
  const isToday = announcementDate.toDateString() === today.toDateString();
  const isPast = announcementDate < today && !isToday;
  const isUpcoming = announcementDate > today;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/list/announcements/view"
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
                Announcement Details
              </h1>
              <p className="text-gray-600 mt-1">{announcement.title}</p>
            </div>
          </div>
        </div>

        {/* Announcement Card */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-3">{announcement.title}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  {announcement.class ? (
                    <span className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold text-sm shadow-md">
                      📚 {announcement.class.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-purple-700 font-semibold text-sm shadow-md">
                      🏫 All School
                    </span>
                  )}
                  {isToday ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-200 text-green-800 rounded-lg text-sm font-semibold animate-pulse">
                      <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                      Today
                    </span>
                  ) : isPast ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Past
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-200 text-blue-800 rounded-lg text-sm font-semibold">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                      </svg>
                      Upcoming
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
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border-2 border-purple-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                    </svg>
                    Announcement Details
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {announcement.description}
                  </p>
                </div>

                {/* Date */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Announcement Date
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                    <div className="text-xs text-blue-600 font-semibold mb-2">DATE</div>
                    <div className="font-bold text-gray-800 text-lg">
                      {announcementDate.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-100">
                  <div className="text-xs text-purple-600 font-semibold mb-1">ANNOUNCEMENT ID</div>
                  <div className="font-mono text-sm text-gray-700 break-all">{announcement.id}</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-100">
                  <div className="text-xs text-green-600 font-semibold mb-1">CREATED</div>
                  <div className="text-sm font-medium text-gray-700">
                    {new Date(announcement.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(announcement.createdAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-100">
                  <div className="text-xs text-amber-600 font-semibold mb-1">LAST UPDATED</div>
                  <div className="text-sm font-medium text-gray-700">
                    {new Date(announcement.updatedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(announcement.updatedAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <Link
                href="/list/announcements/view"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Back to List
              </Link>
              <Link
                href="/list/announcements"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl"
              >
                Back to Announcements
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetailPage;