import prisma from "@/lib/prisma";
import FormModal from "./FormModal";

// Mock auth to remove Clerk dependency
async function getCurrentUser(): Promise<{ role: "admin" | "teacher" | "student" | "parent" | null; id?: string }> {
  return { role: "admin", id: "mock-user-id" };
}

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "report";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  relatedData?: any; // ✅ ADDED: relatedData to the type definition
};

const FormContainer = async ({ table, type, data, id, relatedData: externalRelatedData }: FormContainerProps) => {
  let relatedData = externalRelatedData || {};

  const { role, id: userId } = await getCurrentUser();
  const currentUserId = userId;

  if (type !== "delete" && !externalRelatedData) {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { classes: studentClasses, grades: studentGrades };
        break;
      
      case "parent":
        const parentStudents = await prisma.student.findMany({
          select: { 
            id: true, 
            studentId: true, 
            name: true, 
            surname: true 
          },
        });
        relatedData = { students: parentStudents };
        break;
      
      case "lesson":
        const lessonSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        const lessonClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        const lessonTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { 
          subjects: lessonSubjects, 
          classes: lessonClasses, 
          teachers: lessonTeachers 
        };
        break;
      
     case "exam":
  const examLessons = await prisma.lesson.findMany({
    where: {
      ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
    },
    select: { 
      id: true, 
      name: true,
      subject: { select: { name: true } },
      class: { 
        select: { 
          name: true, 
          gradeId: true,
          grade: { select: { level: true } } // ADD THIS LINE
        } 
      },
      teacher: { select: { name: true, surname: true } }
    },
  });
  relatedData = { lessons: examLessons };
  break;
      
      case "assignment":
        const assignmentLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: {
            id: true,
            name: true,
            subject: { select: { id: true, name: true } },
            class: { 
              select: { 
                id: true,
                name: true,
                grade: { select: { level: true } }
              } 
            },
            teacher: { select: { id: true, name: true, surname: true } }
          },
        });
        relatedData = { lessons: assignmentLessons };
        break;
      
      case "result":
        const resultExams = await prisma.exam.findMany({
          where: {
            ...(role === "teacher" ? { lessons: { some: { lesson: { teacherId: currentUserId! } } } } : {}),
          },
          select: {
            id: true,
            title: true,
            startTime: true,
            lessons: {
              select: {
                lesson: {
                  select: {
                    id: true,
                    name: true,
                    subject: { select: { id: true, name: true } },
                    class: {
                      select: {
                        id: true,
                        name: true,
                        students: {
                          select: {
                            id: true,
                            studentId: true,
                            name: true,
                            surname: true,
                          },
                          orderBy: [
                            { surname: "asc" },
                            { name: "asc" },
                          ],
                        },
                      },
                    },
                    teacher: { select: { id: true, name: true, surname: true } },
                  },
                },
              },
            },
          },
          orderBy: { startTime: "desc" },
        });

        const resultAssignments = await prisma.assignment.findMany({
          where: {
            ...(role === "teacher" ? { lesson: { teacherId: currentUserId! } } : {}),
          },
          select: {
            id: true,
            title: true,
            startDate: true,
            lesson: {
              select: {
                id: true,
                name: true,
                subject: { select: { id: true, name: true } },
                class: {
                  select: {
                    id: true,
                    name: true,
                    students: {
                      select: {
                        id: true,
                        studentId: true,
                        name: true,
                        surname: true,
                      },
                      orderBy: [
                        { surname: "asc" },
                        { name: "asc" },
                      ],
                    },
                  },
                },
                teacher: { select: { id: true, name: true, surname: true } },
              },
            },
          },
          orderBy: { startDate: "desc" },
        });

        relatedData = {
          exams: resultExams,
          assignments: resultAssignments,
        };
        break;
      
      case "report":
        relatedData = {};
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;