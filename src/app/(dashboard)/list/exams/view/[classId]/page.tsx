import prisma from "@/lib/prisma";
import Link from "next/link";

// Define proper types for the data structure
interface ExamData {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  subjects: string[];
  teachers: string[];
}

async function getClassExams(classId: number) {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      gradeId: true,
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
          exams: {
            select: {
              exam: {
                select: {
                  id: true,
                  title: true,
                  startTime: true,
                  endTime: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!classData) return null;

  // Get unique exams with their lesson details
  const examMap = new Map<number, {
    id: number;
    title: string;
    startTime: Date;
    endTime: Date;
    subjects: Set<string>;
    teachers: Set<string>;
  }>();
  
  classData.lessons.forEach(lesson => {
    lesson.exams.forEach(examLesson => {
      const exam = examLesson.exam;
      if (!examMap.has(exam.id)) {
        examMap.set(exam.id, {
          ...exam,
          subjects: new Set<string>(),
          teachers: new Set<string>()
        });
      }
      
      const examData = examMap.get(exam.id);
      if (examData) {
        examData.subjects.add(lesson.subject.name);
        examData.teachers.add(`${lesson.teacher.name} ${lesson.teacher.surname}`);
      }
    });
  });

  // Convert to array and format
  const exams: ExamData[] = Array.from(examMap.values()).map(exam => ({
    id: exam.id,
    title: exam.title,
    startTime: exam.startTime,
    endTime: exam.endTime,
    subjects: Array.from(exam.subjects),
    teachers: Array.from(exam.teachers)
  })).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return {
    class: classData,
    gradeName: classData.grade.level === 0 ? "Grade R" : `Grade ${classData.grade.level}`,
    exams
  };
}

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

interface ClassExamViewProps {
  params: { classId: string };
}

const ClassExamView = async ({ params }: ClassExamViewProps) => {
  const classId = parseInt(params.classId);
  const data = await getClassExams(classId);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-400">Class not found</h1>
          <Link href="/list/exams/view" className="text-purple-600 hover:underline mt-4 inline-block">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  const { class: classData, gradeName, exams } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/list/exams/view?gradeId=${classData.gradeId}`}
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
                {gradeName} - {classData.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {exams.length} Exam{exams.length !== 1 ? "s" : ""} Scheduled
              </p>
            </div>
          </div>
        </div>

        {/* Exams Display */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-6">
          {exams.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-xl font-semibold text-gray-400">No exams scheduled</p>
              <p className="text-gray-500 mt-2">There are no exams scheduled for this class yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => {
                const duration = Math.round((exam.endTime.getTime() - exam.startTime.getTime()) / (1000 * 60));
                const hours = Math.floor(duration / 60);
                const minutes = duration % 60;
                const isUpcoming = exam.startTime > new Date();
                const isPast = exam.endTime < new Date();

                return (
                  <div
                    key={exam.id}
                    className={`rounded-xl p-6 border-2 transition-all duration-300 ${
                      isPast 
                        ? "bg-gray-50 border-gray-200" 
                        : isUpcoming 
                        ? "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:border-indigo-300 hover:shadow-lg"
                        : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                    }`}
                  >
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex-1 min-w-[300px]">
                        {/* Status Badge */}
                        <div className="mb-3">
                          {isPast ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Completed
                            </span>
                          ) : isUpcoming ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-200 text-blue-700 rounded-full text-xs font-semibold">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Upcoming
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-200 text-green-700 rounded-full text-xs font-semibold animate-pulse">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              In Progress
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-800 mb-3">{exam.title}</h3>
                        
                        {/* Subjects */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {exam.subjects.map((subject, idx) => (
                            <div key={idx} className={`inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r ${getSubjectColor(subject)} text-white font-semibold text-xs shadow-md`}>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              {subject}
                            </div>
                          ))}
                        </div>

                        {/* Teachers */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <div className="flex flex-wrap gap-1">
                            {exam.teachers.map((teacher, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700">
                                {teacher}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Date and Time Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                          <div className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-lg border border-gray-200">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="text-xs">
                              <div className="text-gray-500">Date</div>
                              <div className="font-semibold text-gray-700">
                                {new Date(exam.startTime).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-lg border border-gray-200">
                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-xs">
                              <div className="text-gray-500">Time</div>
                              <div className="font-semibold text-gray-700">
                                {new Date(exam.startTime).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-lg border border-gray-200">
                            <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <div className="text-xs">
                              <div className="text-gray-500">Duration</div>
                              <div className="font-semibold text-gray-700">
                                {hours > 0 && `${hours}h `}{minutes}min
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassExamView;