// app/list/reports/page.tsx
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import ViewReports from "@/components/ViewReports";

// Mock auth method
async function getCurrentUser(): Promise<{ role: "admin" | "teacher" | "student" | "parent" | null; id?: string }> {
  return { role: "admin", id: "user_123" };
}

type ReportList = {
  id: number;
  studentName: string;
  studentSurname: string;
  studentId: string;
  subject: string;
  term: string;
  year: number;
  marks: number;
  grade: string;
  teacherName: string;
};

const ReportListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { role, id: currentUserId } = await getCurrentUser();

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Subject", accessor: "subject" },
    { header: "Term", accessor: "term", className: "hidden md:table-cell" },
    { header: "Year", accessor: "year", className: "hidden md:table-cell" },
    { header: "Marks", accessor: "marks" },
    { header: "Grade", accessor: "grade" },
    { header: "Teacher", accessor: "teacher", className: "hidden lg:table-cell" },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: ReportList) => {
    const marksColor =
      item.marks >= 75
        ? "text-green-600 bg-green-50"
        : item.marks >= 50
        ? "text-yellow-600 bg-yellow-50"
        : "text-red-600 bg-red-50";

    const gradeColor =
      ["A", "B"].includes(item.grade)
        ? "bg-green-100 text-green-700"
        : ["C", "D"].includes(item.grade)
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

    const termLabels: Record<string, string> = {
      TERM1: "Term 1",
      TERM2: "Term 2",
      TERM3: "Term 3",
      TERM4: "Term 4",
    };

    return (
      <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
        <td className="flex items-center gap-4 p-4">
          <div>
            <p className="font-medium">{item.studentName} {item.studentSurname}</p>
            <p className="text-xs text-gray-500">{item.studentId}</p>
          </div>
        </td>
        <td className="font-medium">{item.subject}</td>
        <td className="hidden md:table-cell">{termLabels[item.term]}</td>
        <td className="hidden md:table-cell">{item.year}</td>
        <td>
          <span className={`px-3 py-1 rounded-full font-bold text-xs ${marksColor}`}>
            {item.marks}%
          </span>
        </td>
        <td>
          <span className={`px-2 py-1 rounded-full font-bold text-xs ${gradeColor}`}>
            {item.grade}
          </span>
        </td>
        <td className="hidden lg:table-cell text-gray-600">{item.teacherName}</td>
        <td>
          {(role === "admin" || role === "teacher") && (
            <div className="flex items-center gap-2">
              <FormContainer table="report" type="update" data={item} />
              <FormContainer table="report" type="delete" id={item.id} />
            </div>
          )}
        </td>
      </tr>
    );
  };

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) || 1 : 1;

  const query: Prisma.ReportWhereInput = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;
    switch (key) {
      case "studentId":
        query.student = {
          OR: [
            { id: value },
            { studentId: value }
          ]
        };
        break;
      case "search":
        query.OR = [
          { subject: { name: { contains: value, mode: "insensitive" } } },
          { student: { name: { contains: value, mode: "insensitive" } } },
          { student: { surname: { contains: value, mode: "insensitive" } } },
        ];
        break;
      case "term":
        query.term = value as any;
        break;
    }
  }

  // Role-based filtering
  switch (role) {
    case "teacher":
      // Teachers can only see reports for subjects they teach
      query.subject = {
        lessons: {
          some: {
            teacherId: currentUserId!,
          },
        },
      };
      break;
    case "student":
      query.studentId = currentUserId!;
      break;
    case "parent":
      query.student = { parentId: currentUserId! };
      break;
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.report.findMany({
      where: query,
      include: {
        student: { 
          select: { 
            id: true, // ADDED
            name: true, 
            surname: true, 
            studentId: true 
          } 
        },
        subject: { select: { name: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: [
        { year: "desc" },
        { term: "asc" },
      ],
    }),
    prisma.report.count({ where: query }),
  ]);

  // Get teacher names for each report
  const data: ReportList[] = await Promise.all(
    dataRes.map(async (item) => {
      // Find the lesson for this subject
      const lesson = await prisma.lesson.findFirst({
        where: {
          subjectId: item.subjectId,
        },
        include: {
          teacher: {
            select: {
              name: true,
              surname: true,
            },
          },
        },
      });

      return {
        id: item.id,
        studentName: item.student.name,
        studentSurname: item.student.surname,
        studentId: item.student.studentId || item.student.id,
        subject: item.subject.name,
        term: item.term,
        year: item.year,
        marks: item.marks,
        grade: item.grade,
        teacherName: lesson ? `${lesson.teacher.name} ${lesson.teacher.surname}` : "N/A",
      };
    })
  );

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT - Table Section */}
      <div className="w-full xl:w-2/3">
        <div className="bg-white p-4 rounded-md flex-1">
          <div className="flex items-center justify-between">
            <h1 className="hidden md:block text-lg font-semibold">Term Reports</h1>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <TableSearch />
              <div className="flex items-center gap-4 self-end">
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                  <Image src="/filter.png" alt="" width={14} height={14} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                  <Image src="/sort.png" alt="" width={14} height={14} />
                </button>
                {(role === "admin" || role === "teacher") && <FormContainer table="report" type="create" />}
              </div>
            </div>
          </div>
          <Table columns={columns} renderRow={renderRow} data={data} />
          <Pagination page={p} count={count} />
        </div>
      </div>

      {/* RIGHT - View Reports Widget */}
      <div className="w-full xl:w-1/3">
        <ViewReports />
      </div>
    </div>
  );
};

export default ReportListPage;