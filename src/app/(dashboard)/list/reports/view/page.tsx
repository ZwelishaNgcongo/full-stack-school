// app/list/reports/view/page.tsx
import Image from "next/image";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

type TermReport = {
  id: number;
  subject: string;
  term: string;
  year: number;
  marks: number;
  grade: string;
  teacherComment: string;
  teacherName: string;
};

async function getStudentReports(studentId: string, termFilter?: string) {
  // Find the student by their studentId field - FIXED: Added id to select
  const student = await prisma.student.findFirst({
    where: { 
      OR: [
        { id: studentId },
        { studentId: studentId }
      ]
    },
    select: {
      id: true, // ADDED
      name: true,
      surname: true,
      studentId: true,
      class: {
        select: {
          id: true, // ADDED
          name: true,
        },
      },
    },
  });

  if (!student) {
    return null;
  }

  // Build the where clause
  const whereClause: any = {
    studentId: student.id,
  };

  if (termFilter) {
    whereClause.term = termFilter;
  }

  // Get all reports for this student
  const reports = await prisma.report.findMany({
    where: whereClause,
    include: {
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      student: {
        include: {
          class: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: [
      { year: "desc" },
      { term: "asc" },
    ],
  });

  // Get teacher information for each subject
  const reportsWithTeachers = await Promise.all(
    reports.map(async (report) => {
      // Find the lesson for this subject and class
      const lesson = await prisma.lesson.findFirst({
        where: {
          subjectId: report.subjectId,
          classId: student.class?.id,
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
        id: report.id,
        subject: report.subject.name,
        term: report.term,
        year: report.year,
        marks: report.marks,
        grade: report.grade,
        teacherComment: report.teacherComment || "",
        teacherName: lesson ? `${lesson.teacher.name} ${lesson.teacher.surname}` : "N/A",
      };
    })
  );

  return {
    student,
    reports: reportsWithTeachers,
  };
}

export default async function StudentReportsViewPage({
  searchParams,
}: {
  searchParams: { studentId?: string; term?: string };
}) {
  const { studentId, term } = searchParams;

  if (!studentId) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center">
          <Image src="/noData.png" alt="" width={100} height={100} className="mx-auto opacity-50" />
          <p className="text-gray-500 mt-4">Please enter a student ID to view reports</p>
          <Link
            href="/list/reports"
            className="mt-4 inline-block bg-lamaPurple text-white py-2 px-4 rounded-lg hover:bg-opacity-90"
          >
            Go to Reports
          </Link>
        </div>
      </div>
    );
  }

  const data = await getStudentReports(studentId, term);

  if (!data) {
    notFound();
  }

  const { student, reports } = data;

  // Group reports by term and year
  const groupedReports = reports.reduce((acc, report) => {
    const key = `${report.year}-${report.term}`;
    if (!acc[key]) {
      acc[key] = {
        year: report.year,
        term: report.term,
        reports: [],
      };
    }
    acc[key].reports.push(report);
    return acc;
  }, {} as Record<string, { year: number; term: string; reports: TermReport[] }>);

  // Calculate statistics
  const totalReports = reports.length;
  const avgMarks = totalReports > 0
    ? (reports.reduce((sum, r) => sum + r.marks, 0) / totalReports).toFixed(1)
    : "0";
  
  const gradeDistribution = reports.reduce((acc, r) => {
    acc[r.grade] = (acc[r.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const termLabels: Record<string, string> = {
    TERM1: "Term 1",
    TERM2: "Term 2",
    TERM3: "Term 3",
    TERM4: "Term 4",
  };

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      {/* Back Button */}
      <Link
        href="/list/reports"
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-fit"
      >
        <span>←</span>
        <span className="font-medium">Back to Reports</span>
      </Link>

      {/* Student Info Header */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-lamaPurple rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {student.name[0]}{student.surname[0]}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {student.name} {student.surname}
            </h1>
            <div className="flex gap-4 mt-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Image src="/id.png" alt="" width={16} height={16} />
                {student.studentId || student.id}
              </span>
              <span className="flex items-center gap-1">
                <Image src="/class.png" alt="" width={16} height={16} />
                {student.class?.name || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Reports</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalReports}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Image src="/singleAttendance.png" alt="" width={20} height={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Average Marks</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{avgMarks}%</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Grade Distribution</p>
              <div className="flex gap-2 mt-1">
                {Object.entries(gradeDistribution).map(([grade, count]) => (
                  <span key={grade} className="text-sm font-semibold text-gray-700">
                    {grade}: {count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports by Term */}
      {Object.keys(groupedReports).length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="text-center py-12">
            <Image
              src="/noData.png"
              alt="No reports"
              width={100}
              height={100}
              className="mx-auto opacity-50"
            />
            <p className="text-gray-500 mt-4">No reports found for this student</p>
          </div>
        </div>
      ) : (
        Object.values(groupedReports).map((group) => (
          <div key={`${group.year}-${group.term}`} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {termLabels[group.term]} - {group.year}
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Teacher</th>
                    <th className="py-3 px-4">Marks</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4 hidden md:table-cell">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {group.reports.map((report) => {
                    const marksColor =
                      report.marks >= 75
                        ? "text-green-600 bg-green-50"
                        : report.marks >= 50
                        ? "text-yellow-600 bg-yellow-50"
                        : "text-red-600 bg-red-50";

                    const gradeColor =
                      ["A", "B"].includes(report.grade)
                        ? "bg-green-100 text-green-700"
                        : ["C", "D"].includes(report.grade)
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700";

                    return (
                      <tr
                        key={report.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {report.subject}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {report.teacherName}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full font-bold ${marksColor}`}
                          >
                            {report.marks}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full font-bold ${gradeColor}`}
                          >
                            {report.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm hidden md:table-cell">
                          {report.teacherComment || "No comment"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Term Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Subjects</p>
                  <p className="text-lg font-bold text-gray-800">{group.reports.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Term Average</p>
                  <p className="text-lg font-bold text-gray-800">
                    {(group.reports.reduce((sum, r) => sum + r.marks, 0) / group.reports.length).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Highest Mark</p>
                  <p className="text-lg font-bold text-gray-800">
                    {Math.max(...group.reports.map(r => r.marks))}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}