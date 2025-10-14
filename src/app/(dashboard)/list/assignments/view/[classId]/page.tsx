import prisma from "@/lib/prisma";
import Link from "next/link";

async function getClassAssignments(classId: number) {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
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
          id: true,
          subject: {
            select: {
              name: true
            }
          },
          teacher: {
            select: {
              name: true,
              surname: true
            }
          },
          assignments: {
            select: {
              id: true,
              title: true,
              startDate: true,
              dueDate: true,
              fileUrl: true
            },
            orderBy: {
              dueDate: 'desc'
            }
          }
        }
      }
    }
  });

  if (!classData) return null;

  // Flatten assignments with lesson info
  const assignments = classData.lessons.flatMap(lesson =>
    lesson.assignments.map(assignment => ({
      ...assignment,
      subject: lesson.subject.name,
      teacher: `${lesson.teacher.name} ${lesson.teacher.surname}`
    }))
  );

  return {
    class: classData,
    gradeName: classData.grade.level === 0 ? "Grade R" : `Grade ${classData.grade.level}`,
    assignments
  };
}

interface ClassAssignmentViewProps {
  params: { classId: string };
}

const ClassAssignmentView = async ({ params }: ClassAssignmentViewProps) => {
  const classId = parseInt(params.classId);
  const data = await getClassAssignments(classId);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-400">Class not found</h1>
          <Link href="/list/assignments/view" className="text-purple-600 hover:underline mt-4 inline-block">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  const { class: classData, gradeName, assignments } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/list/assignments/view?gradeId=${classData.grade}`}
              className="w-10 h-10 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl blur-md opacity-50"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                {gradeName} - {classData.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {assignments.length} Assignment{assignments.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Assignments Display */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6">
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xl font-semibold text-gray-400">No assignments found</p>
              <p className="text-gray-500 mt-2">There are no assignments for this class yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-[250px]">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{assignment.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm mb-3">
                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="font-semibold text-gray-700">{assignment.subject}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-gray-600">{assignment.teacher}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="text-xs">
                          <span className="text-gray-500">Start:</span>
                          <span className="ml-1 font-semibold text-gray-700">
                            {new Date(assignment.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Due:</span>
                          <span className="ml-1 font-semibold text-red-600">
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {assignment.fileUrl && (
                        <Link
                          href={assignment.fileUrl.startsWith("/") ? assignment.fileUrl : `/uploads/${assignment.fileUrl}`}
                          download
                          target="_blank"
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download
                        </Link>
                      )}
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassAssignmentView;