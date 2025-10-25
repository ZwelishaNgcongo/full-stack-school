// app/list/events/page.tsx
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Event, Grade, Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

async function getCurrentUser(): Promise<{ role: "admin" | "teacher" | "student" | "parent" | null }> {
  return { role: "admin" };
}

type EventList = Event & { grade: Grade | null };

// Get count of active events (ongoing + upcoming)
async function getActiveEventsCount() {
  const now = new Date();
  
  const count = await prisma.event.count({
    where: {
      endTime: {
        gte: now, // Events that haven't ended yet
      },
    },
  });
  
  return count;
}

const EventListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { role } = await getCurrentUser();

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Date & Time",
      accessor: "date",
      className: "hidden lg:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
      className: "hidden xl:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item: EventList) => {
    const startTime = new Date(item.startTime);
    const endTime = new Date(item.endTime);
    const now = new Date();
    const isUpcoming = startTime > now;
    const isPast = endTime < now;

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="p-4">
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800">{item.title}</h3>
            {item.description && (
              <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                {item.description}
              </p>
            )}
          </div>
        </td>
        <td className="hidden md:table-cell">
          {item.grade ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Grade {item.grade.level === 0 ? 'R' : item.grade.level}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              All School
            </span>
          )}
        </td>
        <td className="hidden lg:table-cell">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-700">
              {new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
              }).format(startTime)}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {startTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
              {" - "}
              {endTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
          </div>
        </td>
        <td className="hidden xl:table-cell">
          {isPast ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Completed
            </span>
          ) : isUpcoming ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
              </svg>
              Upcoming
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              In Progress
            </span>
          )}
        </td>
        <td>
          <div className="flex items-center gap-2">
            <Link
              href={`/list/events/view`}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaPurple hover:bg-lamaPurpleLight transition-colors"
              title="View Events"
            >
              <Image src="/calendar.png" alt="View Events" width={16} height={16} />
            </Link>
            {role === "admin" && (
              <>
                <FormContainer table="event" type="update" data={item} />
                <FormContainer table="event" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.EventWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.title = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count, activeCount] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: {
        grade: true,
      },
      orderBy: {
        startTime: "desc",
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.event.count({ where: query }),
    // Get active events count
    prisma.event.count({
      where: {
        endTime: {
          gte: new Date(),
        },
      },
    }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <Link
              href="/list/events/view"
              className="relative px-4 py-2 bg-lamaPurple text-white rounded-md hover:bg-lamaPurpleLight transition-colors font-medium flex items-center gap-2"
            >
              <Image src="/calendar.png" alt="" width={16} height={16} />
              View Events
              {activeCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                  {activeCount}
                </span>
              )}
            </Link>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="event" type="create" />}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default EventListPage;