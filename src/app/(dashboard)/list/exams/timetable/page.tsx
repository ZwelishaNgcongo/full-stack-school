import prisma from "@/lib/prisma";
import Link from "next/link";

// Mock auth
async function getCurrentUser(): Promise<{ role: "admin" | "teacher" | "student" | "parent" | null; id?: string }> {
  return { role: "admin", id: "mock-user-id" };
}

type ExamWithDetails = {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  lesson: {
    subject: { name: string };
    class: { name: string; gradeId: number };
    teacher: { name: string; surname: string };
  };
};

async function getExamsByGrade(gradeId?: number): Promise<ExamWithDetails[]> {
  const exams = await prisma.exam.findMany({
    where: gradeId ? {
      lesson: {
        class: {
          gradeId: gradeId,
        },
      },
    } : {},
    include: {
      lesson: {
        include: {
          subject: { select: { name: true } },
          class: { select: { name: true, gradeId: true } },
          teacher: { select: { name: true, surname: true } },
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });
  return exams;
}

async function getGrades() {
  return await prisma.grade.findMany({
    select: { id: true, level: true },
    orderBy: { level: "asc" },
  });
}

// Subject color mapping
const subjectColors: Record<string, string> = {
  Mathematics: "from-blue-400 to-blue-600",
  English: "from-green-400 to-green-600",
  Physics: "from-purple-400 to-purple-600",
  Chemistry: "from-pink-400 to-pink-600",
  Biology: "from-teal-400 to-teal-600",
  History: "from-orange-400 to-orange-600",
  Geography: "from-yellow-400 to-yellow-600",
  Computer: "from-indigo-400 to-indigo-600",
  Art: "from-rose-400 to-rose-600",
  Music: "from-cyan-400 to-cyan-600",
};

const getSubjectColor = (subject: string) => {
  return subjectColors[subject] || "from-gray-400 to-gray-600";
};

// Group exams by date
const groupExamsByDate = (exams: ExamWithDetails[]) => {
  const grouped: Record<string, ExamWithDetails[]> = {};
  
  exams.forEach((exam) => {
    const dateKey = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(exam.startTime);
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(exam);
  });
  
  return grouped;
};

interface ExamTimetablePageProps {
  searchParams: { gradeId?: string };
}

const ExamTimetablePage = async ({ searchParams }: ExamTimetablePageProps) => {
  const { role } = await getCurrentUser();
  const selectedGradeId = searchParams.gradeId ? parseInt(searchParams.gradeId) : undefined;
  
  const [exams, grades] = await Promise.all([
    getExamsByGrade(selectedGradeId),
    getGrades(),
  ]);

  const groupedExams = groupExamsByDate(exams);
  const selectedGrade = grades.find(g => g.id === selectedGradeId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6">
      {/* Animated background decoration */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-400 to-purple-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative">
        {/* Back Button */}
        <Link 
          href="/list/exams"
          className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Exams
        </Link>

        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-6 border-2 border-purple-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl blur-md opacity-50"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Exam Timetable
                </h1>
                <p className="text-gray-600 mt-1">
                  {selectedGrade 
                    ? (selectedGrade.level === 0 ? "Grade R" : `Grade ${selectedGrade.level}`) 
                    : "All Grades"} • {exams.length} Exam{exams.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Grade Selector - Server-side form */}
              <form action="/list/exams/timetable" method="get" className="flex items-center gap-2">
                <select
                  name="gradeId"
                  defaultValue={selectedGradeId || ""}
                  className="px-4 py-3 border-2 border-purple-200 rounded-xl bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="">All Grades</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.level === 0 ? "Grade R" : `Grade ${grade.level}`}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Filter
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Timetable Content */}
        {exams.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-purple-100">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Exams Scheduled</h3>
                <p className="text-gray-600">
                  {selectedGrade 
                    ? `No exams found for ${selectedGrade.level === 0 ? "Grade R" : `Grade ${selectedGrade.level}`}. Try selecting a different grade.`
                    : "No exams have been scheduled yet. Create some exams to see them here."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedExams).map(([date, dateExams]) => (
              <div key={date} className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-purple-100">
                {/* Date Header */}
                <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {date}
                  </h2>
                </div>

                {/* Exams Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Time</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Subject</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Exam Title</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Class</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Teacher</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dateExams.map((exam, index) => {
                        const duration = Math.round((exam.endTime.getTime() - exam.startTime.getTime()) / (1000 * 60));
                        const hours = Math.floor(duration / 60);
                        const minutes = duration % 60;
                        
                        return (
                          <tr
                            key={exam.id}
                            className={`border-t border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold text-gray-900">
                                  {new Intl.DateTimeFormat("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }).format(exam.startTime)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r ${getSubjectColor(exam.lesson.subject.name)} text-white font-semibold text-sm shadow-md`}>
                                {exam.lesson.subject.name}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-900 font-medium">{exam.title}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm">
                                {exam.lesson.class.name}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-xs">
                                    {exam.lesson.teacher.name[0]}{exam.lesson.teacher.surname[0]}
                                  </span>
                                </div>
                                <span className="text-gray-700 font-medium">
                                  {exam.lesson.teacher.name} {exam.lesson.teacher.surname}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-600 font-medium">
                                {hours > 0 && `${hours}h `}{minutes}min
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamTimetablePage;