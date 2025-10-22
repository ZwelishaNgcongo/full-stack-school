// app/list/results/view/[studentId]/page.tsx
import Image from "next/image";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

type StudentResult = {
  id: number;
  score: number;
  type: "Exam" | "Assignment";
  title: string;
  subject: string;
  className: string;
  teacher: string;
  date: Date;
  maxScore?: number;
};

async function getStudentResults(studentId: string) {
  // First, find the student by their studentId field
  const student = await prisma.student.findFirst({
    where: { 
      OR: [
        { id: studentId },
        { studentId: studentId }
      ]
    },
    select: {
      id: true,
      name: true,
      surname: true,
      studentId: true,
      class: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!student) {
    return null;
  }

  // Get all results for this student
  const results = await prisma.result.findMany({
    where: {
      studentId: student.id,
    },
    include: {
      exam: {
        include: {
          lesson: {
            include: {
              subject: true,
              class: true,
              teacher: {
                select: {
                  name: true,
                  surname: true,
                },
              },
            },
          },
        },
      },
      assignment: {
        include: {
          lesson: {
            include: {
              subject: true,
              class: true,
              teacher: {
                select: {
                  name: true,
                  surname: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  // Transform results
  const transformedResults: StudentResult[] = results
    .map((result) => {
      const assessment = result.exam || result.assignment;
      if (!assessment) return null;

      const isExam = "startTime" in assessment;

      return {
        id: result.id,
        score: result.score,
        type: isExam ? "Exam" as const : "Assignment" as const,
        title: assessment.title,
        subject: assessment.lesson.subject.name,
        className: assessment.lesson.class.name,
        teacher: `${assessment.lesson.teacher.name} ${assessment.lesson.teacher.surname}`,
        date: isExam ? assessment.startTime : assessment.startDate,
        maxScore: 100,
      };
    })
    .filter(Boolean) as StudentResult[];

  return {
    student,
    results: transformedResults,
  };
}

export default async function StudentResultsViewPage({
  params,
}: {
  params: { studentId: string };
}) {
  const data = await getStudentResults(params.studentId);

  if (!data) {
    notFound();
  }

  const { student, results } = data;

  // Calculate statistics
  const exams = results.filter((r) => r.type === "Exam");
  const assignments = results.filter((r) => r.type === "Assignment");
  const avgScore =
    results.length > 0
      ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)
      : "0";
  const avgExamScore =
    exams.length > 0
      ? (exams.reduce((sum, r) => sum + r.score, 0) / exams.length).toFixed(1)
      : "0";
  const avgAssignmentScore =
    assignments.length > 0
      ? (assignments.reduce((sum, r) => sum + r.score, 0) / assignments.length).toFixed(1)
      : "0";

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      {/* Back Button */}
      <Link
        href="/list/results"
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-fit"
      >
       
        <span className="font-medium">Back to Results</span>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Results</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{results.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Image src="/result.png" alt="" width={20} height={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Average Score</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{avgScore}%</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Exam Avg</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{avgExamScore}%</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Image src="/exam.png" alt="" width={20} height={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Assignment Avg</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{avgAssignmentScore}%</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Image src="/assignment.png" alt="" width={20} height={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">All Results</h2>
        
        {results.length === 0 ? (
          <div className="text-center py-12">
            <Image
              src="/noData.png"
              alt="No results"
              width={100}
              height={100}
              className="mx-auto opacity-50"
            />
            <p className="text-gray-500 mt-4">No results found for this student</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 hidden md:table-cell">Class</th>
                  <th className="py-3 px-4 hidden md:table-cell">Teacher</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => {
                  const percentage = result.score;
                  const scoreColor =
                    percentage >= 75
                      ? "text-green-600 bg-green-50"
                      : percentage >= 50
                      ? "text-yellow-600 bg-yellow-50"
                      : "text-red-600 bg-red-50";

                  return (
                    <tr
                      key={result.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            result.type === "Exam"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {result.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {result.title}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{result.subject}</td>
                      <td className="py-3 px-4 text-gray-600 hidden md:table-cell">
                        {result.className}
                      </td>
                      <td className="py-3 px-4 text-gray-600 hidden md:table-cell">
                        {result.teacher}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full font-bold ${scoreColor}`}
                        >
                          {result.score}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm hidden lg:table-cell">
                        {new Intl.DateTimeFormat("en-US").format(result.date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}