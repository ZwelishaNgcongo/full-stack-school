// components/AnnouncementWidgetClient.tsx
// Use this version if you need to filter by user role/class
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Announcement {
  id: number;
  title: string;
  description: string;
  date: string;
  class: { name: string } | null;
}

interface AnnouncementWidgetClientProps {
  userId?: string;
  role?: string;
  classId?: number;
}

const AnnouncementWidgetClient = ({ userId, role, classId }: AnnouncementWidgetClientProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const params = new URLSearchParams();
        if (userId) params.append("userId", userId);
        if (role) params.append("role", role);
        if (classId) params.append("classId", classId.toString());

        const response = await fetch(`/api/announcements/recent?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data);
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [userId, role, classId]);

  const today = new Date();

  const backgroundColors = [
    "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200",
    "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200",
    "bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200",
  ];

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h1 className="text-lg font-bold text-gray-800">Announcements</h1>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-800">Announcements</h1>
        </div>
        <Link 
          href="/list/announcements/view" 
          className="text-xs text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors flex items-center gap-1"
        >
          View All
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {announcements.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p className="text-sm text-gray-400 font-medium">No announcements</p>
          </div>
        ) : (
          announcements.map((announcement, index) => {
            const announcementDate = new Date(announcement.date);
            const isToday = announcementDate.toDateString() === today.toDateString();

            return (
              <Link
                key={announcement.id}
                href={`/list/announcements/view/${announcement.id}`}
                className={`${backgroundColors[index]} rounded-lg p-4 border-2 hover:shadow-md transition-all duration-300 group cursor-pointer`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors line-clamp-1 flex-1">
                    {announcement.title}
                  </h2>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-gray-500 bg-white rounded-md px-2 py-1 font-medium shadow-sm">
                      {announcementDate.toLocaleDateString("en-US", { 
                        month: "short", 
                        day: "numeric" 
                      })}
                    </span>
                    {isToday && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        Today
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                  {announcement.description}
                </p>

                <div className="flex items-center justify-between">
                  {announcement.class ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">
                      📚 {announcement.class.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700">
                      🏫 All School
                    </span>
                  )}

                  <div className="flex items-center gap-1 text-purple-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View Details</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {announcements.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Link
            href="/list/announcements/view"
            className="w-full block text-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg"
          >
            View All Announcements
          </Link>
        </div>
      )}
    </div>
  );
};

export default AnnouncementWidgetClient;