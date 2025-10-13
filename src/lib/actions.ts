"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  ParentSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";

type CurrentState = { success: boolean; error: boolean };

// Type definitions for Prisma results
interface LessonResult {
  id: number;
  name: string;
  startTime: Date;
  endTime: Date;
  day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
  subjectId: number;
  classId: number;
  teacherId: string;
}

/* ------------------- PARENT ------------------- */

export const createParent = async (state: any, data: ParentSchema) => {
  try {
    console.log("Creating parent with data:", data);

    if (!data.password) {
      console.error("Password is required for parent creation");
      return { success: false, error: true };
    }

    if (!data.studentId) {
      console.error("Student ID is required for parent creation");
      return { success: false, error: true };
    }

    console.log("Checking if student exists with studentId:", data.studentId);
    const studentExists = await prisma.student.findUnique({
      where: { studentId: data.studentId },
      select: { id: true, studentId: true, name: true, surname: true }
    });

    if (!studentExists) {
      console.error("Student not found with studentId:", data.studentId);
      const availableStudents = await prisma.student.findMany({ 
        select: { id: true, studentId: true, name: true, surname: true } 
      });
      console.log("Available students:", availableStudents);
      return { success: false, error: true };
    }

    console.log("Student found:", studentExists.name, studentExists.surname, "ID:", studentExists.studentId);

    const existingParent = await prisma.parent.findUnique({
      where: { username: data.username },
    });

    if (existingParent) {
      console.error("Username already exists:", data.username);
      return { success: false, error: true };
    }

    const existingParentForStudent = await prisma.parent.findFirst({
      where: {
        students: {
          some: { id: studentExists.id }
        }
      }
    });

    if (existingParentForStudent) {
      console.error("Student already has a parent assigned:", data.studentId);
      return { success: false, error: true };
    }

    const createdParent = await prisma.parent.create({
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        password: data.password,
        students: {
          connect: { id: studentExists.id },
        },
      },
      include: {
        students: {
          select: { id: true, studentId: true, name: true, surname: true }
        },
      },
    });

    console.log("Parent created successfully:", createdParent.id);
    console.log("Connected to student:", createdParent.students);
    
    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.error("createParent error:", err);
    if (err instanceof Error) {
      console.error("Error details:", err.message);
      console.error("Error stack:", err.stack);
    }
    return { success: false, error: true };
  }
};

export const updateParent = async (state: any, data: ParentSchema) => {
  try {
    console.log("Updating parent with data:", data);

    if (!data.id) {
      console.error("Parent ID is required for update");
      return { success: false, error: true };
    }

    const parentExists = await prisma.parent.findUnique({
      where: { id: data.id },
      include: { 
        students: {
          select: { id: true, studentId: true, name: true, surname: true }
        }
      }
    });

    if (!parentExists) {
      console.error("Parent not found with ID:", data.id);
      return { success: false, error: true };
    }

    let studentDatabaseId = null;
    if (data.studentId) {
      const studentExists = await prisma.student.findUnique({
        where: { studentId: data.studentId },
        select: { id: true, studentId: true, name: true, surname: true }
      });

      if (!studentExists) {
        console.error("Student not found with studentId:", data.studentId);
        return { success: false, error: true };
      }
      
      studentDatabaseId = studentExists.id;
      console.log("Student found for update:", studentExists.name, studentExists.surname, "ID:", studentExists.studentId);
    }

    const updateData: any = {
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
    };

    if (data.studentId && studentDatabaseId) {
      updateData.students = {
        set: [{ id: studentDatabaseId }],
      };
    }

    const updatedParent = await prisma.parent.update({
      where: { id: data.id },
      data: updateData,
      include: {
        students: {
          select: { id: true, studentId: true, name: true, surname: true }
        },
      },
    });

    console.log("Parent updated successfully:", updatedParent.id);
    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.error("updateParent error:", err);
    if (err instanceof Error) {
      console.error("Error details:", err.message);
    }
    return { success: false, error: true };
  }
};

export const deleteParent = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.parent.delete({ where: { id } });
    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteParent error:", err);
    return { success: false, error: true };
  }
};

/* ------------------- SUBJECT ------------------- */

export const createSubject = async (currentState: CurrentState, data: SubjectSchema) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers?.map((teacherId) => ({ id: teacherId })) || [],
        },
      },
    });
    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.error("createSubject error:", err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (currentState: CurrentState, data: SubjectSchema) => {
  try {
    await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers?.map((teacherId) => ({ id: teacherId })) || [],
        },
      },
    });
    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.error("updateSubject error:", err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (currentState: CurrentState, data: FormData) => {
  const id = Number(data.get("id"));
  try {
    await prisma.subject.delete({ where: { id } });
    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteSubject error:", err);
    return { success: false, error: true };
  }
};

/* ------------------- CLASS ------------------- */

export const createClass = async (currentState: CurrentState, data: ClassSchema) => {
  try {
    await prisma.class.create({ data });
    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.error("createClass error:", err);
    return { success: false, error: true };
  }
};

export const updateClass = async (currentState: CurrentState, data: ClassSchema) => {
  try {
    await prisma.class.update({
      where: { id: data.id },
      data,
    });
    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.error("updateClass error:", err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (currentState: CurrentState, data: FormData) => {
  const id = Number(data.get("id"));
  try {
    await prisma.class.delete({ where: { id } });
    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteClass error:", err);
    return { success: false, error: true };
  }
};

/* ------------------- TEACHER ------------------- */

export const createTeacher = async (currentState: CurrentState, data: TeacherSchema) => {
  try {
    const { password, ...teacherData } = data;

    if (!password) {
      throw new Error("Password is required.");
    }

    await prisma.teacher.create({
      data: {
        username: teacherData.username,
        name: teacherData.name,
        surname: teacherData.surname,
        email: teacherData.email || null,
        phone: teacherData.phone || null,
        address: teacherData.address,
        img: teacherData.img || null,
        sex: teacherData.sex,
        birthday: teacherData.birthday,
        password,
        subjects: {
          connect: teacherData.subjects?.map((subjectId) => ({
            id: Number(subjectId),
          })) || [],
        },
      },
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error("createTeacher error:", err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (currentState: CurrentState, data: TeacherSchema) => {
  if (!data.id) return { success: false, error: true };
  try {
    const { password, ...teacherData } = data;
    
    await prisma.teacher.update({
      where: { id: data.id },
      data: {
        username: teacherData.username,
        name: teacherData.name,
        surname: teacherData.surname,
        email: teacherData.email || null,
        phone: teacherData.phone || null,
        address: teacherData.address,
        img: teacherData.img || null,
        sex: teacherData.sex,
        birthday: teacherData.birthday,
        subjects: {
          set: teacherData.subjects?.map((subjectId) => ({
            id: Number(subjectId),
          })) || [],
        },
      },
    });
    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error("updateTeacher error:", err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.teacher.delete({ where: { id } });
    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteTeacher error:", err);
    return { success: false, error: true };
  }
};

/* ------------------- STUDENT ------------------- */

export const createStudent = async (currentState: CurrentState, data: StudentSchema) => {
  try {
    console.log("createStudent called with data:", data);

    if (!data.username || !data.name || !data.surname || !data.birthday || !data.sex) {
      console.error("Missing required fields:", { 
        username: !!data.username, 
        name: !!data.name, 
        surname: !!data.surname, 
        birthday: !!data.birthday, 
        sex: !!data.sex 
      });
      return { success: false, error: true };
    }

    if (!data.gradeId || !data.classId) {
      console.error("Missing grade or class:", { gradeId: data.gradeId, classId: data.classId });
      return { success: false, error: true };
    }

    const generateUniqueId = () => {
      return `stu_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    };

    const studentData = {
      id: data.id || generateUniqueId(),
      studentId: data.studentId || data.username,
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      password: data.password || "defaultpass123",
      sex: data.sex,
      birthday: typeof data.birthday === 'string' ? new Date(data.birthday) : data.birthday,
      gradeId: data.gradeId,
      classId: data.classId,
      parentId: data.parentId || null,
      img: null,
    };

    console.log("Prepared student data:", studentData);

    const [gradeExists, classExists] = await Promise.all([
      prisma.grade.findUnique({ where: { id: studentData.gradeId } }),
      prisma.class.findUnique({ where: { id: studentData.classId } })
    ]);

    if (!gradeExists) {
      console.error("Grade not found:", studentData.gradeId);
      return { success: false, error: true };
    }

    if (!classExists) {
      console.error("Class not found:", studentData.classId);
      return { success: false, error: true };
    }

    console.log("Grade and class validation passed");

    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [
          { username: studentData.username },
          { studentId: studentData.studentId }
        ]
      }
    });

    if (existingStudent) {
      console.error("Student already exists:", existingStudent);
      return { success: false, error: true };
    }

    const createdStudent = await prisma.student.create({ 
      data: studentData,
      include: {
        class: true,
        grade: true
      }
    });

    console.log("Student created successfully:", createdStudent.id);
    
    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error("createStudent error:", err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (currentState: CurrentState, data: StudentSchema) => {
  try {
    console.log("Updating student with data object");

    if (!data.id) throw new Error("Database ID is required for update.");

    const updateData: any = {
      studentId: data.studentId || data.username,
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || "Not provided",
      sex: data.sex,
      birthday: new Date(data.birthday),
    };

    if (data.gradeId) updateData.gradeId = data.gradeId;
    if (data.classId) updateData.classId = data.classId;
    if (data.parentId) updateData.parentId = data.parentId;

    console.log("Updating student with:", updateData);

    await prisma.student.update({
      where: { id: data.id },
      data: updateData,
    });

    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error("updateStudent error:", err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.student.delete({ where: { id } });
    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteStudent error:", err);
    return { success: false, error: true };
  }
};

/* ------------------- LESSON ------------------- */

export const createLesson = async (currentState: CurrentState, data: any) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: new Date(`1970-01-01T${data.startTime}:00`),
        endTime: new Date(`1970-01-01T${data.endTime}:00`),
        subjectId: Number(data.subjectId),
        classId: Number(data.classId),
        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.error("createLesson error:", err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (currentState: CurrentState, data: any) => {
  try {
    if (!data.id) {
      return { success: false, error: true };
    }

    await prisma.lesson.update({
      where: {
        id: Number(data.id),
      },
      data: {
        name: data.name,
        day: data.day,
        startTime: new Date(`1970-01-01T${data.startTime}:00`),
        endTime: new Date(`1970-01-01T${data.endTime}:00`),
        subjectId: Number(data.subjectId),
        classId: Number(data.classId),
        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.error("updateLesson error:", err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (currentState: CurrentState, data: FormData) => {
  const id = Number(data.get("id"));
  
  try {
    await prisma.lesson.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteLesson error:", err);
    return { success: false, error: true };
  }
};

/* ------------------- EXAM ------------------- */

export const createExam = async (currentState: CurrentState, data: ExamSchema) => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.error("createExam error:", err);
    return { success: false, error: true };
  }
};

export const updateExam = async (currentState: CurrentState, data: ExamSchema) => {
  try {
    await prisma.exam.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.error("updateExam error:", err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (currentState: CurrentState, data: FormData) => {
  const id = Number(data.get("id"));
  try {
    await prisma.exam.delete({ where: { id } });
    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteExam error:", err);
    return { success: false, error: true };
  }
};

export const getLessons = async (type: "teacherId" | "classId", id: string | number) => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as number },
    });

    const events = lessons.map((lesson: LessonResult) => ({
      title: lesson.name,
      start: lesson.startTime,
      end: lesson.endTime,
    }));

    return { success: true, data: events, error: false };
  } catch (err) {
    console.error("getLessons error:", err);
    return { success: false, data: [], error: true };
  }
};

/* ------------------- HELPER FUNCTIONS ------------------- */

/**
 * Fetch class with all students for the form
 */
export async function getClassWithStudents(classId: number) {
  return await prisma.class.findUnique({
    where: { id: classId },
    include: {
      supervisor: {
        select: {
          id: true,
          name: true,
          surname: true,
        },
      },
      grade: {
        select: {
          id: true,
          level: true,
        },
      },
      students: {
        select: {
          id: true,
          studentId: true,
          name: true,
          surname: true,
          sex: true,
          email: true,
        },
        orderBy: [
          { surname: "asc" },
          { name: "asc" },
        ],
      },
      _count: {
        select: {
          students: true,
        },
      },
    },
  });
}

/**
 * Get all teachers for supervisor assignment
 */
export async function getAllTeachers() {
  return await prisma.teacher.findMany({
    select: {
      id: true,
      name: true,
      surname: true,
    },
    orderBy: [
      { surname: "asc" },
      { name: "asc" },
    ],
  });
}

/**
 * Helper to get related data for forms
 */
export async function getClassFormRelatedData() {
  const [teachers, grades] = await Promise.all([
    prisma.teacher.findMany({
      select: { id: true, name: true, surname: true },
      orderBy: [{ surname: "asc" }, { name: "asc" }],
    }),
    prisma.grade.findMany({
      select: { id: true, level: true },
      orderBy: { level: "asc" },
    }),
  ]);

  return { teachers, grades };
}

/**
 * Get class statistics for dashboard
 */
export async function getClassStatistics() {
  const classes = await prisma.class.findMany({
    include: {
      _count: {
        select: { students: true },
      },
      students: {
        select: { sex: true },
      },
    },
  });

  const stats = classes.map(cls => {
    const maleCount = cls.students.filter(s => s.sex === "MALE").length;
    const femaleCount = cls.students.filter(s => s.sex === "FEMALE").length;

    return {
      id: cls.id,
      name: cls.name,
      totalStudents: cls._count.students,
      maleCount,
      femaleCount,
      capacity: cls.capacity,
      utilizationRate: (cls._count.students / cls.capacity) * 100,
    };
  });

  return stats;
}

/**
 * Export class register to CSV or similar format
 */
export async function exportClassRegister(classId: number) {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      students: {
        select: {
          studentId: true,
          name: true,
          surname: true,
          sex: true,
          birthday: true,
          email: true,
          phone: true,
        },
        orderBy: [
          { surname: "asc" },
          { name: "asc" },
        ],
      },
      supervisor: {
        select: {
          name: true,
          surname: true,
        },
      },
      grade: {
        select: {
          level: true,
        },
      },
    },
  });

  if (!classData) {
    throw new Error("Class not found");
  }

  const registerData = {
    className: classData.name,
    grade: `Grade ${classData.grade.level === 0 ? 'R' : classData.grade.level}`,
    supervisor: classData.supervisor 
      ? `${classData.supervisor.name} ${classData.supervisor.surname}`
      : "No supervisor assigned",
    capacity: classData.capacity,
    totalStudents: classData.students.length,
    maleCount: classData.students.filter(s => s.sex === "MALE").length,
    femaleCount: classData.students.filter(s => s.sex === "FEMALE").length,
    students: classData.students,
  };

  return registerData;
}

/**
 * Bulk assign students to a class
 */
export async function bulkAssignStudentsToClass(
  studentIds: string[],
  classId: number
) {
  try {
    await prisma.student.updateMany({
      where: {
        id: {
          in: studentIds,
        },
      },
      data: {
        classId: classId,
      },
    });

    revalidatePath("/list/classes");
    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error bulk assigning students:", err);
    return { success: false, error: true };
  }
}

export const createAssignment = async (currentState: any, data: any) => {
  try {
    await prisma.assignment.create({
      data: {
        title: data.title,
        description: data.description || null,
        startDate: new Date(data.startDate),
        dueDate: new Date(data.dueDate),
        lessonId: Number(data.lessonId),
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.error("createAssignment error:", err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (currentState: any, data: any) => {
  try {
    if (!data.id) throw new Error("Assignment ID required.");

    await prisma.assignment.update({
      where: { id: Number(data.id) },
      data: {
        title: data.title,
        description: data.description || null,
        startDate: new Date(data.startDate),
        dueDate: new Date(data.dueDate),
        lessonId: Number(data.lessonId),
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.error("updateAssignment error:", err);
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (currentState: any, formData: FormData) => {
  const id = Number(formData.get("id"));
  try {
    await prisma.assignment.delete({
      where: { id },
    });
    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteAssignment error:", err);
    return { success: false, error: true };
  }
};

/**
 * Fetch all lessons for assignment selection
 */
export const getAllLessons = async () => {
  try {
    const lessons = await prisma.lesson.findMany({
      select: {
        id: true,
        name: true,
        subject: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
        class: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });
    return lessons.map((lesson) => ({
      id: lesson.id,
      label: `${lesson.subject.name} - ${lesson.class.name} (${lesson.teacher.name} ${lesson.teacher.surname})`,
    }));
  } catch (err) {
    console.error("getAllLessons error:", err);
    return [];
  }
};
