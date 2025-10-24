import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Link from "next/link";

async function getCurrentUser(): Promise<{ role: "admin" | "teacher" | "student" | "parent" | null; id?: string }> {
  return { role: "admin", id: "mock-user-id" };
}

type ExamWithDetails = {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  lessons: {
    lessonId: number;
    lesson: {
      subject: { name: string };
      teacher: { name: string; surname: string };
      class: { 
        name: string; 
        gradeId: number;
        grade: { level: number }; // ADDED: Include grade level
      };
    };
  }[];
};

async function getExams(query: any, p: number): Promise<[ExamWithDetails[], number]> {
  const [data, count] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: {
        lessons: {
          include: {
            lesson: {
              select: {
                subject: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
                class: { 
                  select: { 
                    name: true, 
                    gradeId: true,
                    grade: { select: { level: true } } // ADDED: Get actual grade level
                  } 
                },
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { startTime: "desc" },
    }),
    prisma.exam.count({ where: query }),
  ]);
  return [data, count];
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
          gradeId: true,
          grade: { select: { level: true } } // ADDED: Get actual grade level
        } 
      },
    },
  });
  return lessons;
}

interface ExamListPageProps {
  searchParams: { [key: string]: string | undefined };
}

const ExamListPage = async ({ searchParams }: ExamListPageProps) => {
  const { role, id: currentUserId } = await getCurrentUser();
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) || 1 : 1;

  const query: any = {};
  
  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;
    switch (key) {
      case "classId":
        query.lessons = {
          some: {
            lesson: { classId: parseInt(value) }
          }
        };
        break;
      case "teacherId":
        query.lessons = {
          some: {
            lesson: { teacherId: value }
          }
        };
        break;
      case "search":
        query.OR = [
          {
            title: { contains: value, mode: "insensitive" }
          },
          {
            lessons: {
              some: {
                lesson: { 
                  subject: { 
                    name: { contains: value, mode: "insensitive" } 
                  } 
                }
              }
            }
          }
        ];
        break;
    }
  }

  // Apply role-based filters
  if (role === "teacher") {
    query.lessons = {
      some: {
        lesson: { teacherId: currentUserId }
      }
    };
  }
  
  if (role === "student") {
    query.lessons = {
      some: {
        lesson: { 
          class: { 
            students: { 
              some: { id: currentUserId } 
            } 
          } 
        }
      }
    };
  }
  
  if (role === "parent") {
    query.lessons = {
      some: {
        lesson: { 
          class: { 
            students: { 
              some: { parentId: currentUserId } 
            } 
          } 
        }
      }
    };
  }

  const [data, count] = await getExams(query, p);
  const lessons = await getLessons();

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Subjects", accessor: "subjects", className: "hidden md:table-cell" },
    { header: "Classes", accessor: "classes" },
    { header: "Date", accessor: "date", className: "hidden lg:table-cell" },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: ExamWithDetails) => {
    // Get unique subjects
    const subjects = [...new Set(item.lessons.map(el => el.lesson.subject.name))];
    
    // Group classes by grade - FIXED: Use grade.level instead of gradeId
    const classesByGrade = item.lessons.reduce((acc: any, el) => {
      const gradeLevel = el.lesson.class.grade.level; // FIXED: Get level from grade object
      const gradeName = gradeLevel === 0 ? "Grade R" : `Grade ${gradeLevel}`;
      if (!acc[gradeName]) {
        acc[gradeName] = [];
      }
      acc[gradeName].push(el.lesson.class.name);
      return acc;
    }, {});

    // Sort grade names properly
    const sortedGrades = Object.keys(classesByGrade).sort((a, b) => {
      const aNum = a === "Grade R" ? 0 : parseInt(a.replace("Grade ", ""));
      const bNum = b === "Grade R" ? 0 : parseInt(b.replace("Grade ", ""));
      return aNum - bNum;
    });

    return (
      <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
        <td className="p-4">
          <div className="font-semibold text-gray-800">{item.title}</div>
        </td>
        <td className="hidden md:table-cell">
          <div className="flex flex-wrap gap-1">
            {subjects.map((subject, idx) => (
              <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                {subject}
              </span>
            ))}
          </div>
        </td>
        <td>
          <div className="flex flex-col gap-2">
            {sortedGrades.map((grade) => (
              <div key={grade} className="flex flex-col">
                <span className="text-xs font-semibold text-gray-600 mb-1">{grade}</span>
                <div className="flex flex-wrap gap-1">
                  {classesByGrade[grade].slice(0, 3).map((className: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {className}
                    </span>
                  ))}
                  {classesByGrade[grade].length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{classesByGrade[grade].length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </td>
        <td className="hidden lg:table-cell">
          <div className="text-sm text-gray-700">
            {new Intl.DateTimeFormat("en-US", { 
              dateStyle: "medium",
              timeStyle: "short"
            }).format(item.startTime)}
          </div>
        </td>
        {(role === "admin" || role === "teacher") && (
          <td>
            <div className="flex items-center gap-2">
              <FormContainer table="exam" type="update" data={item} relatedData={{ lessons }} />
              <FormContainer table="exam" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <Link
            href="/list/exams/view"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all font-semibold shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            View Timetable
          </Link>
          {(role === "admin" || role === "teacher") && (
            <FormContainer table="exam" type="create" relatedData={{ lessons }} />
          )}
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ExamListPage;