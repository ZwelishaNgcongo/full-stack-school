import Image from "next/image";
import EventCalendar from "./EventCalendar";
import EventList from "../app/(dashboard)/list/events/page"; // ✅ Change this line
import prisma from "@/lib/prisma";

const EventCalendarContainer = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { date } = searchParams;
  
  // Get event count for the selected date
  const selectedDate = date ? new Date(date) : new Date();
  const eventCount = await prisma.event.count({
    where: {
      startTime: {
        gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        lte: new Date(selectedDate.setHours(23, 59, 59, 999)),
      },
    },
  });

  return (
    <div className="bg-white p-4 rounded-md">
      <EventCalendar />
      
      {/* Header with event indicator */}
      <div className="flex items-center justify-between mt-4 mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Events</h1>
          {eventCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 animate-pulse">
              {eventCount} {eventCount === 1 ? 'event' : 'events'}
            </span>
          )}
        </div>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>

      {/* Event list or empty state */}
      <div className="flex flex-col gap-4">
        {eventCount > 0 ? (
          <EventList dateParam={date} />
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No events scheduled</p>
            <p className="text-sm text-gray-400 mt-1">Select a different date to view events</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCalendarContainer;
