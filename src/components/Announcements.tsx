
'use client';

import { useEffect, useState } from 'react';

interface Announcement {
  id: string;
  title: string;
  description: string;
  date: Date;
}

interface AnnouncementsProps {
  userId?: string;
  role?: string;
}

const Announcements = ({ userId, role }: AnnouncementsProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/announcements?userId=${userId}&role=${role}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch announcements');
        }
        
        const data = await response.json();
        setAnnouncements(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load announcements');
        console.error('Failed to fetch announcements:', err);
      } finally {
        setLoading(false);
      }
    };

    // Always fetch announcements, even without userId/role for testing
    fetchAnnouncements();
  }, [userId, role]);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Announcements</h1>
          <span className="text-xs text-gray-400">View All</span>
        </div>
        <div className="flex flex-col gap-4 mt-4">
          <p className="text-sm text-gray-400">Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Announcements</h1>
          <span className="text-xs text-gray-400">View All</span>
        </div>
        <div className="flex flex-col gap-4 mt-4">
          <p className="text-sm text-gray-400">Failed to load announcements</p>
        </div>
      </div>
    );
  }

  const backgroundColors = ['bg-lamaSkyLight', 'bg-lamaPurpleLight', 'bg-lamaYellowLight'];

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {announcements.length === 0 ? (
          <p className="text-sm text-gray-400">No announcements available</p>
        ) : (
          announcements.slice(0, 3).map((announcement, index) => (
            <div key={announcement.id} className={`${backgroundColors[index]} rounded-md p-4`}>
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{announcement.title}</h2>
                <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                  {new Intl.DateTimeFormat("en-GB").format(new Date(announcement.date))}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{announcement.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;