import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";

async function getCurrentUser(): Promise<{ id: string | null; role: "admin" | "teacher" | "student" | "parent" | null }> {
  return { id: null, role: "admin" };
}

type AnnouncementWithClass = Prisma.AnnouncementGetPayload<{ include: { class: true } }>;

async function getAnnouncements(query: any, p: number): Promise<[AnnouncementWithClass[], number]> {
  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: { class: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { date: "desc" },
    }),
    prisma.announcement.count({ where: query }),
  ]);
  return [data, count];
}

async function getClasses() {
  return await prisma.class.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

// Get count of active announcements (today + upcoming)
async function getActiveAnnouncementsCount() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const count = await prisma.announcement.count({
    where: {
      date: {
        gte: today,
      },
    },
  });
  
  return count;
}

interface AnnouncementListPageProps {
  searchParams: { [key: string]: string | undefined };
}

const AnnouncementListPage = async ({ searchParams }: AnnouncementListPageProps) => {
  const { id: currentUserId, role } = await getCurrentUser();
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) || 1 : 1;

  const query: any = {};
  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;
    if (key === "search") query.title = { contains: value, mode: "insensitive" };
  }

  if (currentUserId && role) {
    const roleConditions: Record<"teacher" | "student" | "parent", any> = {
      teacher: { lessons: { some: { teacherId: currentUserId } } },
      student: { students: { some: { id: currentUserId } } },
      parent: { students: { some: { parentId: currentUserId } } },
    };
    query.OR = [{ classId: null }, { class: roleConditions[role as "teacher" | "student" | "parent"] ?? {} }];
  }

  const [data, count] = await getAnnouncements(query, p);
  const classes = await getClasses();
  const activeCount = await getActiveAnnouncementsCount();

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Class", accessor: "class" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    { header: "Actions", accessor: "action" },
  ];

  const renderRow = (item: AnnouncementWithClass) => {
    const announcementDate = new Date(item.date);
    const today = new Date();
    const isToday = announcementDate.toDateString() === today.toDateString();
    const isPast = announcementDate < today && !isToday;

    return (
      <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-50 transition">
        <td className="p-4">
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800">{item.title}</h3>
            <p className="text-xs text-gray-500 line-clamp-1 mt-1">
              {item.description}
            </p>
          </div>
        </td>
        <td>
          {item.class ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {item.class.name}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              All School
            </span>
          )}
        </td>
        <td className="hidden md:table-cell">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-700">
              {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(announcementDate)}
            </span>
            {isToday && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold w-fit">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Today
              </span>
            )}
            {isPast && (
              <span className="text-xs text-gray-400">Past</span>
            )}
          </div>
        </td>
        <td>
          <div className="flex items-center gap-2">
            <Link
              href={`/list/announcements/view/${item.id}`}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky hover:bg-sky-400 transition-colors"
              title="View announcement"
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
              </svg>
            </Link>
            {role === "admin" && (
              <>
                <FormContainer table="announcement" type="update" data={item} relatedData={{ classes }} />
                <FormContainer table="announcement" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Announcement View Banner - Following assignment, exam, and event style */}
      <div className="mb-6 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <div className="text-white">
              <h3 className="text-xl font-bold">View Announcements Board</h3>
              <p className="text-sm text-white/90">Browse all school announcements and notices</p>
            </div>
          </div>
          <Link 
            href="/list/announcements/view"
            className="relative px-6 py-3 bg-white text-purple-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            View Board
            {activeCount > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                {activeCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Existing content */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold text-gray-700">All Announcements</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="announcement" type="create" relatedData={{ classes }} />}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AnnouncementListPage;