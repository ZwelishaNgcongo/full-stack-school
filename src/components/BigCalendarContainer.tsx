"use client";

import { useEffect, useState } from 'react';
import BigCalendarClientWrapper from './BigCalendarClientWrapper';
import { getLessons } from '@/lib/actions'; // Adjust the import path as needed
import { adjustScheduleToCurrentWeek } from '@/lib/utils';

const BigCalendarContainer = ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  const [schedule, setSchedule] = useState<{ title: string; start: Date; end: Date }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const result = await getLessons(type, id);
        
        if (result.success) {
          const adjustedSchedule = adjustScheduleToCurrentWeek(result.data);
          setSchedule(adjustedSchedule);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch lessons:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [type, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">Failed to load calendar data</div>
      </div>
    );
  }

  return <BigCalendarClientWrapper data={schedule} />;
};

export default BigCalendarContainer;