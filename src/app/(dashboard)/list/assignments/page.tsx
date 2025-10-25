import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";
import Link from "next/link";

async function getCurrentUser(): Promise<{ id: string | null; role: "admin" | "teacher" | "student" | "parent" | null }> {
  // TODO: Implement actual user authentication
  return { id: null, role: "admin" };
}

type SimplifiedAssignment = {
  id: number;
  title: string;
  startDate: Date;
  dueDate: Date;
  fileUrl?: string | null;
  lesson: {
    subject: { name: string };
    teacher: { name: string; surname: string };
    class: { name: string };
  };
};

async function getAssignments(query: any, p: number): Promise<[SimplifiedAssignment[], number]> {
  const [rawData, count] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: query,
      select: {
        id: true,
        title: true,
        startDate: true,
        dueDate: true,
        fileUrl: true,
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, surname: true } },
            class: { select: { name: true } },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { dueDate: "desc" },
    }),
    prisma.assignment.count({ where: query }),
  ]);

  return [rawData, count];
}

async function getLessons() {
  const lessons = await prisma.lesson.findMany({
    select: {
      id: true,
      name: true,
      subject: { select: { name: true } },
      teacher: { select: { name: true, surname: true } },
      class: { 
        select: { 
          name: true,
          grade: { select: { level: true } }
        } 
      },
    },
  });
  return lessons;
}

interface AssignmentListPageProps {
  searchParams: { [key: string]: string | undefined };
}

const AssignmentListPage = async ({ searchParams }: AssignmentListPageProps) => {
  const { id: currentUserId, role } = await getCurrentUser();
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) || 1 : 1;

  const query: any = { lesson: {} };
  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;
    if (key === "classId") query.lesson.classId = parseInt(value);
    if (key === "teacherId") query.lesson.teacherId = value;
    if (key === "search") {
      query.lesson.subject = { name: { contains: value, mode: "insensitive" } };
    }
  }

  switch (role) {
    case "teacher":
      query.lesson.teacherId = currentUserId;
      break;
    case "student":
      query.lesson.class = { students: { some: { id: currentUserId } } };
      break;
    case "parent":
      query.lesson.class = { students: { some: { parentId: currentUserId } } };
      break;
  }

  const [data, count] = await getAssignments(query, p);
  const lessons = await getLessons();

  const columns = [
    { header: "Subject Name", accessor: "name" },
    { header: "Class", accessor: "class" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Due Date", accessor: "dueDate", className: "hidden md:table-cell" },
    { header: "File", accessor: "file", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: SimplifiedAssignment) => {
    const formattedData = {
      id: item.id,
      title: item.title,
      startDate: item.startDate,
      dueDate: item.dueDate,
      fileUrl: item.fileUrl,
      lessonId: item.lesson ? null : null,
      lesson: item.lesson,
    };

    return (
      <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
        <td className="flex items-center gap-4 p-4">{item.lesson.subject.name}</td>
        <td>{item.lesson.class.name}</td>
        <td className="hidden md:table-cell">{item.lesson.teacher.name + " " + item.lesson.teacher.surname}</td>
        <td className="hidden md:table-cell">{new Intl.DateTimeFormat("en-US").format(item.dueDate)}</td>
        <td className="hidden md:table-cell">
          {item.fileUrl ? (
            <Link
              href={item.fileUrl.startsWith("/") ? item.fileUrl : `/uploads/${item.fileUrl}`}
              download
              className="text-purple-600 hover:underline font-medium"
            >
              Download
            </Link>
          ) : (
            <span className="text-gray-400 italic">No file</span>
          )}
        </td>
        {(role === "admin" || role === "teacher") && (
          <td>
            <div className="flex items-center gap-2">
              <FormModal table="assignment" type="update" data={formattedData} relatedData={{ lessons }} />
              <FormModal table="assignment" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Assignment View Banner - Following lesson timetable style */}
      <div className="mb-6 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="text-white">
              <h3 className="text-xl font-bold">View Assignments by Class</h3>
              <p className="text-sm text-white/90">Browse assignments organized by grade and class</p>
            </div>
          </div>
          <Link 
            href="/list/assignments/view"
            className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Assignments
          </Link>
        </div>
      </div>

      {/* Existing content */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Assignments</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormModal table="assignment" type="create" relatedData={{ lessons }} />
            )}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AssignmentListPage;