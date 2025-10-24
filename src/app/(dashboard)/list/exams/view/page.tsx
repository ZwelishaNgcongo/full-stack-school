import prisma from "@/lib/prisma";
import Link from "next/link";

async function getCurrentUser(): Promise<{ id: string | null; role: "admin" | "teacher" | "student" | "parent" | null }> {
  return { id: null, role: "admin" };
}

// Fetch all grades
async function getGrades() {
  const grades = await prisma.grade.findMany({
    select: {
      id: true,
      level: true,
    },
    orderBy: {
      level: 'asc'
    }
  });
  return grades.map(g => ({
    id: g.id,
    level: g.level,
    name: g.level === 0 ? "Grade R" : `Grade ${g.level}`
  }));
}

// Fetch classes for a specific grade with exam counts
async function getClassesForGrade(gradeId: number) {
  const classes = await prisma.class.findMany({
    where: {
      gradeId: gradeId
    },
    select: {
      id: true,
      name: true,
      grade: {
        select: {
          level: true
        }
      },
      lessons: {
        select: {
          exams: {
            select: {
              exam: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      }
    }
  });

  return classes.map(cls => {
    // Get unique exam IDs for this class
    const examIds = new Set(
      cls.lessons.flatMap(lesson => 
        lesson.exams.map(examLesson => examLesson.exam.id)
      )
    );
    
    return {
      id: cls.id,
      name: cls.name,
      gradeLevel: cls.grade.level,
      examCount: examIds.size
    };
  });
}

interface ExamViewPageProps {
  searchParams: { [key: string]: string | undefined };
}

const ExamViewPage = async ({ searchParams }: ExamViewPageProps) => {
  const { role } = await getCurrentUser();
  const selectedGradeId = searchParams.gradeId ? parseInt(searchParams.gradeId) : null;
  
  const grades = await getGrades();
  const classes = selectedGradeId ? await getClassesForGrade(selectedGradeId) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/list/exams"
                className="w-10 h-10 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-pink-500 rounded-2xl blur-md opacity-50"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  View Exams
                </h1>
                <p className="text-gray-600 mt-1">
                  Select a grade and class to view exams
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Grade Selection */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-800">Step 1: Select Grade</h2>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-50">
              {grades.map((grade) => {
                const isSelected = selectedGradeId === grade.id;
                return (
                  <Link
                    key={grade.id}
                    href={`/list/exams/view?gradeId=${grade.id}`}
                    className={`block w-full p-4 rounded-xl text-left transition-all duration-300 ${
                      isSelected
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{grade.name}</span>
                      {isSelected && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Class Selection */}
          <div className={`bg-white rounded-2xl shadow-lg border-2 border-pink-100 p-6 transition-all duration-300 ${
            selectedGradeId ? "hover:shadow-xl" : "opacity-50 cursor-not-allowed"
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-800">Step 2: Select Class</h2>
            </div>
            {!selectedGradeId ? (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="font-semibold">Select a grade first</p>
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="font-semibold">No classes available</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-pink-50">
                {classes.map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/list/exams/view/${cls.id}`}
                    className="block w-full p-4 rounded-xl text-left transition-all duration-300 bg-gray-50 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:shadow-lg hover:scale-105 text-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{cls.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
                          {cls.examCount} exam{cls.examCount !== 1 ? "s" : ""}
                        </span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {!selectedGradeId && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-12 text-center">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">Select Grade & Class</h3>
            <p className="text-gray-500">Choose a grade and class to view their exams</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamViewPage;