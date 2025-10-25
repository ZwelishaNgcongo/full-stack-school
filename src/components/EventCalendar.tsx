"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface EventCalendarProps {
  eventDates?: string[]; // Array of date strings with events
}

const EventCalendar = ({ eventDates = [] }: EventCalendarProps) => {
  const [value, onChange] = useState<Value>(new Date());
  const router = useRouter();

  useEffect(() => {
    if (value instanceof Date) {
      router.push(`?date=${value.toISOString()}`);
    }
  }, [value, router]);

  // Check if a date has events
  const hasEvent = (date: Date) => {
    // Create a date string using local timezone to avoid UTC offset issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const localDateString = `${year}-${month}-${day}`;
    
    return eventDates.some(eventDate => {
      const eventDateObj = new Date(eventDate);
      const eventYear = eventDateObj.getFullYear();
      const eventMonth = String(eventDateObj.getMonth() + 1).padStart(2, '0');
      const eventDay = String(eventDateObj.getDate()).padStart(2, '0');
      const eventLocalDateString = `${eventYear}-${eventMonth}-${eventDay}`;
      
      return eventLocalDateString === localDateString;
    });
  };

  // Add custom styling to tiles with events
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && hasEvent(date)) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1 animate-pulse"></div>
        </div>
      );
    }
    return null;
  };

  // Add custom class names to tiles with events
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && hasEvent(date)) {
      return 'event-day';
    }
    return null;
  };

  return (
    <>
      <Calendar 
        onChange={onChange} 
        value={value}
        tileContent={tileContent}
        tileClassName={tileClassName}
      />
      
      {/* Custom CSS for event days */}
      <style jsx global>{`
        .event-day {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%) !important;
          font-weight: 600 !important;
          position: relative;
        }
        
        .event-day:hover {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%) !important;
        }
        
        .react-calendar__tile--active.event-day {
          background: linear-gradient(135deg, rgb(249, 115, 22) 0%, rgb(236, 72, 153) 100%) !important;
          color: white !important;
        }
        
        .react-calendar__tile--active.event-day:hover {
          background: linear-gradient(135deg, rgb(234, 88, 12) 0%, rgb(219, 39, 119) 100%) !important;
        }

        /* Add a subtle border to event days */
        .event-day abbr {
          border-bottom: 2px solid rgba(249, 115, 22, 0.3);
          padding-bottom: 2px;
        }
      `}</style>
    </>
  );
};

export default EventCalendar;