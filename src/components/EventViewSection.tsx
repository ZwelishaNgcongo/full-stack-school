// Server Component version for Admin Dashboard
import prisma from "@/lib/prisma";
import EventViewSectionClient from "./EventViewSectionClient";

const EventViewSection = async () => {
  // Fetch upcoming events (events that haven't ended yet)
  const events = await prisma.event.findMany({
    where: {
      endTime: {
        gte: new Date(),
      },
    },
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
    take: 10, // Limit to 10 events
  });

  // Convert dates to strings for client component
  const eventsForClient = events.map((event) => ({
    ...event,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt ? event.updatedAt.toISOString() : new Date().toISOString(),
  }));

  return <EventViewSectionClient events={eventsForClient} />;
};

export default EventViewSection;