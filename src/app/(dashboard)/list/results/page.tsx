// ...imports
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import ViewResults from "@/components/ViewResults";

// ✅ Mock auth method
async function getCurrentUser(): Promise<{ role: "admin" | "teacher" | "student" | "parent" | null; id?: string }> {
  return { role: "admin", id: "user_123" }; // for testing purposes
}

type ResultList = {
  id: number;
  title: string;
  studentName: string;
  studentSurname: string;
  teacherName: string;
  teacherSurname: string;
  score: number;
  className: string;
  startTime: Date;
};

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // ✅ Use mocked auth
  const { role, id: currentUserId } = await getCurrentUser();

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Student", accessor: "student" },
    { header: "Score", accessor: "score", className: "hidden md:table-cell" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Class", accessor: "class", className: "hidden md:table-cell" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: ResultList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{item.studentName + " " + item.studentSurname}</td>
      <td className="hidden md:table-cell">{item.score}</td>
      <td className="hidden md:table-cell">{item.teacherName + " " + item.teacherSurname}</td>
      <td className="hidden md:table-cell">{item.className}</td>
      <td className="hidden md:table-cell">{new Intl.DateTimeFormat("en-US").format(item.startTime)}</td>
      <td>
        {(role === "admin" || role === "teacher") && (
          <div className="flex items-center gap-2">
            <FormContainer table="result" type="update" data={item} />
            <FormContainer table="result" type="delete" id={item.id} />
          </div>
        )}
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) || 1 : 1;

  const query: Prisma.ResultWhereInput = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;
    switch (key) {
      case "studentId":
        query.studentId = value;
        break;
      case "search":
        query.OR = [
          { exam: { title: { contains: value, mode: "insensitive" } } },
          { student: { name: { contains: value, mode: "insensitive" } } },
        ];
        break;
    }
  }

  // FIXED: Updated role-based filters for exam many-to-many relationship
  switch (role) {
    case "teacher":
      query.OR = [
        { 
          exam: { 
            lessons: { 
              some: { 
                lesson: { teacherId: currentUserId! } 
              } 
            } 
          } 
        },
        { assignment: { lesson: { teacherId: currentUserId! } } },
      ];
      break;
    case "student":
      query.studentId = currentUserId!;
      break;
    case "parent":
      query.student = { parentId: currentUserId! };
      break;
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { 
          select: { 
            name: true, 
            surname: true,
            class: { 
              select: { 
                name: true 
              } 
            } // ✅ FIXED: Include student's actual class
          } 
        },
        exam: {
          select: {
            id: true,
            title: true,
            startTime: true,
            lessons: {
              take: 1, // Get first lesson for display (teacher info only)
              include: {
                lesson: {
                  select: {
                    teacher: { select: { name: true, surname: true } },
                  },
                },
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query }),
  ]);

  const data = dataRes
    .map((item) => {
      const assessment = item.exam || item.assignment;
      if (!assessment) return null;

      const isExam = "startTime" in assessment;
      
      // Get student's actual class
      const studentClass = (item.student as any).class?.name || "No Class";

      // FIXED: Handle exam data structure - use student's actual class
      if (isExam && item.exam) {
        const firstLesson = item.exam.lessons[0]?.lesson;
        if (!firstLesson) return null;

        return {
          id: item.id,
          title: item.exam.title,
          studentName: item.student.name,
          studentSurname: item.student.surname,
          teacherName: firstLesson.teacher.name,
          teacherSurname: firstLesson.teacher.surname,
          score: item.score,
          className: studentClass, // ✅ FIXED: Show student's actual class
          startTime: item.exam.startTime,
        };
      }

      // FIXED: Assignment handling - also use student's actual class
      if (item.assignment) {
        return {
          id: item.id,
          title: item.assignment.title,
          studentName: item.student.name,
          studentSurname: item.student.surname,
          teacherName: item.assignment.lesson.teacher.name,
          teacherSurname: item.assignment.lesson.teacher.surname,
          score: item.score,
          className: studentClass, // ✅ FIXED: Show student's actual class
          startTime: item.assignment.startDate,
        };
      }

      return null;
    })
    .filter(Boolean) as ResultList[];

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT - Table Section */}
      <div className="w-full xl:w-2/3">
        <div className="bg-white p-4 rounded-md flex-1">
          <div className="flex items-center justify-between">
            <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <TableSearch />
              <div className="flex items-center gap-4 self-end">
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                  <Image src="/filter.png" alt="" width={14} height={14} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                  <Image src="/sort.png" alt="" width={14} height={14} />
                </button>
                {(role === "admin" || role === "teacher") && <FormContainer table="result" type="create" />}
              </div>
            </div>
          </div>
          <Table columns={columns} renderRow={renderRow} data={data} />
          <Pagination page={p} count={count} />
        </div>
      </div>

      {/* RIGHT - View Results Widget */}
      <div className="w-full xl:w-1/3">
        <ViewResults />
      </div>
    </div>
  );
};

export default ResultListPage;