// components/Announcements.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";

async function getRecentAnnouncements() {
  try {
    const announcements = await prisma.announcement.findMany({
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
      take: 5, // Get only the 5 most recent announcements
    });

    return announcements;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}

const Announcements = async () => {
  const announcements = await getRecentAnnouncements();
  const today = new Date();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Announcements</h2>
        <Link
          href="/list/announcements/view"
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View All
        </Link>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p className="text-sm text-gray-400">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => {
            const announcementDate = new Date(announcement.date);
            const isToday = announcementDate.toDateString() === today.toDateString();
            const isPast = announcementDate < today && !isToday;

            return (
              <div
                key={announcement.id}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-100 hover:shadow-md transition-shadow"
              >
                {/* Title and Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm flex-1">
                    {announcement.title}
                  </h3>
                  {isToday && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-200 text-green-800 rounded-full text-xs font-semibold whitespace-nowrap">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
                      Today
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {announcement.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {announcement.class ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-medium">
                        📚 {announcement.class.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-medium">
                        🏫 All School
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500">
                    {announcementDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View More Button */}
      {announcements.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Link
            href="/list/announcements"
            className="block w-full text-center py-2 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all font-medium text-sm"
          >
            Manage Announcements
          </Link>
        </div>
      )}
    </div>
  );
};

export default Announcements;