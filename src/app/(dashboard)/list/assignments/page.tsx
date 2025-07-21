import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";

async function getCurrentUser(): Promise<{ id: string | null; role: "admin" | "teacher" | "student" | "parent" | null }> {
  return { id: null, role: null };
}

type SimplifiedAssignment = {
  id: number;
  title: string;
  startDate: Date;
  dueDate: Date;
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

  const columns = [
    { header: "Subject Name", accessor: "name" },
    { header: "Class", accessor: "class" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Due Date", accessor: "dueDate", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: SimplifiedAssignment) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-gray-50 hover:bg-purple-50 transition text-sm">
      <td className="flex items-center gap-4 p-4">{item.lesson.subject.name}</td>
      <td>{item.lesson.class.name}</td>
      <td className="hidden md:table-cell">{item.lesson.teacher.name + " " + item.lesson.teacher.surname}</td>
      <td className="hidden md:table-cell">{new Intl.DateTimeFormat("en-US").format(item.dueDate)}</td>
      {(role === "admin" || role === "teacher") && (
        <td>
          <div className="flex items-center gap-2">
            <FormModal table="assignment" type="update" data={item} />
            <FormModal table="assignment" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="card flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold text-gray-700">All Assignments</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="btn-icon">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="btn-icon">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && <FormModal table="assignment" type="create" />}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AssignmentListPage;
